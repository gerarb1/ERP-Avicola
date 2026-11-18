#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
root_dir=$PWD
# Never accept an external host, DATABASE_URL or database name from the caller.
unset PGHOSTADDR PGSERVICE PGSERVICEFILE PGOPTIONS
export PGHOST=127.0.0.1 PGPORT="${ERP_TEST_PGPORT:-5432}" PGUSER=postgres PGDATABASE=postgres
export PGPASSWORD="${ERP_TEST_DB_PASSWORD:-postgres}" PGCONNECT_TIMEOUT=5
[[ "$PGPORT" =~ ^[0-9]+$ ]] || { echo 'Invalid test PostgreSQL port' >&2; exit 1; }
for tool in pnpm python3 psql createdb dropdb pg_dump pg_restore curl setsid; do
  command -v "$tool" >/dev/null || { echo "Missing prerequisite: $tool" >&2; exit 1; }
done
for port in 8790 5174; do
  python3 - "$port" <<'PY'
import socket, sys
with socket.socket() as sock:
    try: sock.bind(('127.0.0.1', int(sys.argv[1])))
    except OSError: sys.exit(f'Test port {sys.argv[1]} is occupied; stop that service first.')
PY
done
test_database="erp_test_$(date +%s)_$$"
restore_database="${test_database}_restore"
export DATABASE_URL
DATABASE_URL=$(python3 - "$test_database" <<'PY'
import os, sys, urllib.parse
print(f"postgresql://postgres:{urllib.parse.quote(os.environ['PGPASSWORD'], safe='')}@127.0.0.1:{os.environ['PGPORT']}/{sys.argv[1]}?sslmode=disable")
PY
)
private_dir=$(mktemp -d)
config="$root_dir/apps/api/.wrangler/test-$$.jsonc"
worker_pid='' web_pid='' database_created=0 restore_created=0
cleanup() {
  code=$?
  trap - EXIT
  for pid in "$web_pid" "$worker_pid"; do
    if [ -n "$pid" ]; then kill -- "-$pid" 2>/dev/null || true; wait "$pid" 2>/dev/null || true; fi
  done
  if [ "$restore_created" = 1 ]; then dropdb --if-exists --force "$restore_database" || code=1; fi
  if [ "$database_created" = 1 ]; then dropdb --if-exists --force "$test_database" || code=1; fi
  rm -f "$config"
  rm -rf "$private_dir"
  exit "$code"
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
createdb "$test_database"
database_created=1
pnpm --filter @erp-avicola/db db:push > "$private_dir/schema.log" 2>&1 || { cat "$private_dir/schema.log"; exit 1; }
# No .env file is needed and no local user file is overwritten.
pnpm --filter @erp-avicola/db exec node --import tsx src/seed.ts
pnpm --filter @erp-avicola/db exec node --import tsx scripts/fixtures-locales.mts
DEMO_CREDENTIALS_FILE="$private_dir/accounts.txt" pnpm --filter @erp-avicola/db exec node --import tsx scripts/crear-cuentas-demo.mts
mkdir -p apps/api/.wrangler
python3 - "$config" <<'PY'
import sys, json, os
from pathlib import Path
config=json.loads(Path('apps/api/wrangler.jsonc').read_text())
config['name']='erp-operacion-tests'
config['main']=str(Path('apps/api/src/index.ts').resolve())
config['hyperdrive']=[{'binding':'HYPERDRIVE', 'id':'00000000000000000000000000000000', 'localConnectionString':os.environ['DATABASE_URL']}]
config['vars']={'APP_ENV':'test'}
Path(sys.argv[1]).write_text(json.dumps(config))
Path(sys.argv[1]).chmod(0o600)
PY
export WRANGLER_SEND_METRICS=false
setsid pnpm --filter @erp-avicola/api exec wrangler dev --local --config "$config" --ip 127.0.0.1 --port 8790 > "$private_dir/worker.log" 2>&1 &
worker_pid=$!
wait_ready() {
  local url=$1 pid=$2 log=$3
  for attempt in $(seq 1 150); do
    if curl --max-time 2 -fsS "$url" >/dev/null 2>&1; then return 0; fi
    if ! kill -0 "$pid" 2>/dev/null; then break; fi
    sleep .4
  done
  # Redact connection details before showing startup diagnostics.
  python3 - "$log" <<'PYLOG'
import os, re, sys
from pathlib import Path
text = Path(sys.argv[1]).read_text(errors='replace')
text = re.sub(r'postgres(?:ql)?://[^\s\"\']+', '[REDACTED_DATABASE_URL]', text)
for key in ('DATABASE_URL', 'PGPASSWORD'):
    if os.environ.get(key): text = text.replace(os.environ[key], '[REDACTED]')
print(text[-8000:], file=sys.stderr)
PYLOG
  echo "Local test service did not become ready: $url" >&2
  return 1
}
wait_ready http://127.0.0.1:8790/health "$worker_pid" "$private_dir/worker.log"
if [ "${ERP_BROWSER_TESTS:-0}" = 1 ]; then
  VITE_API_URL=http://127.0.0.1:8790 setsid pnpm --filter @erp-avicola/web exec vite --config vite.config.ts --host 127.0.0.1 --port 5174 --strictPort --mode test > "$private_dir/web.log" 2>&1 &
  web_pid=$!
  wait_ready http://127.0.0.1:5174/login "$web_pid" "$private_dir/web.log"
  ERP_TEST_CREDENTIALS="$private_dir/accounts.txt" node tests/operacion_ui.cjs
fi
ERP_TEST_CREDENTIALS="$private_dir/accounts.txt" python3 tests/operacion_api.py
# Restore only this run's disposable fixture data, never an operational backup.
pg_dump --format=custom --no-owner --no-acl --file="$private_dir/test.dump" "$test_database"
createdb "$restore_database"
restore_created=1
pg_restore --exit-on-error --no-owner --no-acl --dbname="$restore_database" "$private_dir/test.dump"
python3 tests/verify-restoration.py "$test_database" "$restore_database"
