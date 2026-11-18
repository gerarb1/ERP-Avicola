"""Compare every public table after restoring this run's disposable test database."""
import hashlib
import json
import os
import re
import subprocess
import sys

source, restored = sys.argv[1:]
if (os.environ.get('PGHOST') != '127.0.0.1'
        or not re.fullmatch(r'erp_test_\d+_\d+', source)
        or restored != source + '_restore'):
    sys.exit('Only a matching pair of disposable local databases is accepted')

def sql(database, query):
    return subprocess.check_output(['psql', '-X', '--no-password', '--set=ON_ERROR_STOP=1',
                                    '--tuples-only', '--no-align', '--dbname', database,
                                    '--command', query])

def snapshot(database):
    tables = sql(database, "SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename").decode().splitlines()
    if not tables:
        raise RuntimeError('No public tables to verify')
    result = {}
    for table in tables:
        name = '"' + table.replace('"', '""') + '"'
        rows = sql(database, f'COPY (SELECT row_to_json(t)::text FROM public.{name} t ORDER BY row_to_json(t)::text) TO STDOUT')
        result[table] = {'rows': len(rows.splitlines()), 'sha256': hashlib.sha256(rows).hexdigest()}
    return result

before, after = snapshot(source), snapshot(restored)
if before != after:
    sys.exit('Restoration mismatch: public table names or row contents differ')
print(json.dumps({'check': 'postgresql_restore', 'status': 'passed', 'tables': len(before),
                  'rows': sum(t['rows'] for t in before.values())}))
