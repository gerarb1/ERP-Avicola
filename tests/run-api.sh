#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
root_dir=$PWD
# Only a new disposable database on loopback is ever created or removed.
export PGHOST=127.0.0.1 PGPORT=5432 PGUSER=postgres
unset PGPASSWORD
if curl -fsS http://127.0.0.1:8790/health >/dev/null 2>&1; then
  echo 'Port 8790 is in use. Stop your test worker before running this script.' >&2; exit 1
fi
test_database="erp_test_$(date +%s)_$$"
export DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/$test_database?sslmode=disable"
private_dir=$(mktemp -d)
config="$root_dir/apps/api/.wrangler/test-$$.jsonc"
worker_pid=''
cleanup() {
  if [ -n "$worker_pid" ]; then kill -- "-$worker_pid" 2>/dev/null || true; wait "$worker_pid" 2>/dev/null || true; fi
  dropdb --if-exists --force "$test_database"
  rm -f "$config"
  rm -rf "$private_dir"
}
createdb "$test_database"
trap cleanup EXIT
pnpm --filter @erp-avicola/db db:push > "$private_dir/schema.log" 2>&1 || { cat "$private_dir/schema.log"; exit 1; }
pnpm --filter @erp-avicola/db db:seed
pnpm --filter @erp-avicola/db exec tsx scripts/fixtures-locales.mts
DEMO_CREDENTIALS_FILE="$private_dir/accounts.txt" pnpm --filter @erp-avicola/db exec tsx scripts/crear-cuentas-demo.mts
mkdir -p apps/api/.wrangler
python - "$config" <<'PY'
import sys,json,os
from pathlib import Path
config=json.loads(Path('apps/api/wrangler.jsonc').read_text())
config['name']='erp-operacion-tests'
config['main']=str(Path('apps/api/src/index.ts').resolve())
config['hyperdrive'][0]['localConnectionString']=os.environ['DATABASE_URL']
Path(sys.argv[1]).write_text(json.dumps(config))
PY
setsid pnpm --filter @erp-avicola/api exec wrangler dev --config "$config" --ip 127.0.0.1 --port 8790 > "$private_dir/worker.log" 2>&1 &
worker_pid=$!
ready=false
for attempt in $(seq 1 100); do
  if curl -fsS http://127.0.0.1:8790/health >/dev/null 2>&1; then ready=true; break; fi
  if ! kill -0 "$worker_pid" 2>/dev/null; then break; fi
  sleep .2
done
if [ "$ready" != true ]; then cat "$private_dir/worker.log"; exit 1; fi
if [ "${ERP_BROWSER_TESTS:-0}" = 1 ]; then
  ERP_TEST_CREDENTIALS="$private_dir/accounts.txt" node tests/operacion_ui.cjs
fi
ERP_TEST_CREDENTIALS="$private_dir/accounts.txt" python tests/operacion_api.py
