#!/usr/bin/env bash

set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_DIR="$ROOT_DIR/server"
CLIENT_DIR="$ROOT_DIR/client"

log() {
  printf '\n[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"
}

fail() {
  printf '\n[ERROR] %s\n' "$*" >&2
  exit 1
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || fail "Missing required command: $1"
}

load_env_file() {
  local env_file="$1"
  if [[ -f "$env_file" ]]; then
    log "Loading env from $env_file"
    set -a
    # shellcheck disable=SC1090
    . "$env_file"
    set +a
  fi
}

resolve_sqlite_path() {
  local raw="$1"
  local path_part="${raw#file:}"
  if [[ "$path_part" = /* ]]; then
    printf '%s\n' "$path_part"
  else
    printf '%s\n' "$SERVER_DIR/$path_part"
  fi
}

backup_sqlite_if_needed() {
  if [[ -z "${DATABASE_URL:-}" ]]; then
    return 0
  fi

  if [[ "${DATABASE_URL}" != file:* ]]; then
    return 0
  fi

  local db_path
  db_path="$(resolve_sqlite_path "$DATABASE_URL")"

  mkdir -p "$(dirname "$db_path")"
  if [[ -f "$db_path" ]]; then
    local stamp backup_path
    stamp="$(date '+%Y%m%d-%H%M%S')"
    backup_path="${db_path}.backup-${stamp}"
    cp "$db_path" "$backup_path"
    log "SQLite backup created: $backup_path"
  else
    log "SQLite database does not exist yet, skipping backup"
  fi
}

install_node_deps() {
  local dir="$1"
  if [[ -f "$dir/package-lock.json" ]]; then
    log "Installing dependencies with npm ci in $dir"
    npm ci --prefix "$dir"
  else
    log "Installing dependencies with npm install in $dir"
    npm install --prefix "$dir"
  fi
}

run_prisma_sync() {
  if [[ -d "$SERVER_DIR/prisma/migrations" ]] && find "$SERVER_DIR/prisma/migrations" -mindepth 1 -maxdepth 1 | read -r; then
    log "Applying Prisma migrations"
    npm --prefix "$SERVER_DIR" run prisma:deploy
  else
    log "No Prisma migrations found, syncing schema with db push"
    npx --prefix "$SERVER_DIR" prisma db push --skip-generate
  fi
}

main() {
  require_cmd node
  require_cmd npm
  require_cmd npx

  load_env_file "$ROOT_DIR/.env"
  load_env_file "$SERVER_DIR/.env"

  [[ -d "$SERVER_DIR" ]] || fail "Server directory not found: $SERVER_DIR"
  [[ -d "$CLIENT_DIR" ]] || fail "Client directory not found: $CLIENT_DIR"

  [[ -n "${APP_MASTER_KEY:-}" ]] || fail "APP_MASTER_KEY is required"
  [[ "${#APP_MASTER_KEY}" -ge 16 ]] || fail "APP_MASTER_KEY must be at least 16 characters"
  [[ -n "${DATABASE_URL:-}" ]] || fail "DATABASE_URL is required"

  if [[ -n "${APP_ADMIN_BOOTSTRAP_USERNAME:-}" && -z "${APP_ADMIN_BOOTSTRAP_PASSWORD:-}" ]]; then
    fail "APP_ADMIN_BOOTSTRAP_PASSWORD is required when APP_ADMIN_BOOTSTRAP_USERNAME is set"
  fi

  if [[ -n "${APP_ADMIN_BOOTSTRAP_PASSWORD:-}" && "${#APP_ADMIN_BOOTSTRAP_PASSWORD}" -lt 12 ]]; then
    fail "APP_ADMIN_BOOTSTRAP_PASSWORD must be at least 12 characters"
  fi

  log "Starting install/build flow"
  install_node_deps "$SERVER_DIR"
  install_node_deps "$CLIENT_DIR"

  backup_sqlite_if_needed

  log "Generating Prisma client"
  npm --prefix "$SERVER_DIR" run prisma:generate

  run_prisma_sync

  log "Building server"
  npm --prefix "$SERVER_DIR" run build

  log "Building client"
  npm --prefix "$CLIENT_DIR" run build

  log "Install completed successfully"
  printf '\nNext step:\n'
  printf '  cd "%s" && npm run start\n' "$SERVER_DIR"
}

main "$@"
