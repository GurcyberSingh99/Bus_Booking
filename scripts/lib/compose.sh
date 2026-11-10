configure_compose() {
  APP_DIR="$1"
  if [[ -f "$APP_DIR/.env.production" && -f "$APP_DIR/docker-compose.prod.yml" ]]; then
    ENV_FILE="$APP_DIR/.env.production"
    COMPOSE=(docker compose --env-file "$APP_DIR/.env.production" -f "$APP_DIR/docker-compose.prod.yml")
  else
    ENV_FILE="$APP_DIR/.env"
    [[ -f "$ENV_FILE" ]] || { printf 'Missing environment file: %s\n' "$ENV_FILE" >&2; return 2; }
    COMPOSE=(docker compose --project-directory "$APP_DIR" --env-file "$ENV_FILE")
  fi
  if [[ "$ENV_FILE" == "$APP_DIR/.env.production" ]]; then
    export POSTGRES_USER="$(decode_env_value POSTGRES_USER_B64)"
    export POSTGRES_PASSWORD="$(decode_env_value POSTGRES_PASSWORD_B64)"
    export DATABASE_URL="$(decode_env_value DATABASE_URL_B64)"
  fi
  POSTGRES_DB="$(read_env_value POSTGRES_DB)"
  [[ -n "$POSTGRES_DB" ]] || { printf 'Missing required environment key: POSTGRES_DB\n' >&2; return 2; }
}

read_env_value() {
  awk -F= -v key="$1" '$1 == key { sub(/^[^=]*=/, ""); sub(/\r$/, ""); print; exit }' "$ENV_FILE"
}

decode_env_value() {
  local encoded
  encoded="$(read_env_value "$1")"
  [[ -n "$encoded" ]] || { printf 'Missing required environment key: %s\n' "$1" >&2; return 2; }
  printf '%s' "$encoded" | base64 --decode
}

compose() {
  "${COMPOSE[@]}" "$@"
}
