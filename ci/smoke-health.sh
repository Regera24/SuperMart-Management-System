#!/usr/bin/env bash
set -euo pipefail

: "${FRONTEND_URL:?FRONTEND_URL is required}"
: "${API_URL:?API_URL is required}"
: "${EUREKA_URL:?EUREKA_URL is required}"

wait_for() {
  local name="$1"
  local url="$2"
  local attempts="${3:-30}"
  local sleep_seconds="${4:-5}"

  for attempt in $(seq 1 "$attempts"); do
    if curl -fsS "$url" >/dev/null; then
      echo "$name is healthy: $url"
      return 0
    fi

    echo "Waiting for $name ($attempt/$attempts): $url"
    sleep "$sleep_seconds"
  done

  echo "$name did not become healthy: $url" >&2
  return 1
}

wait_for "eureka-server" "$EUREKA_URL/actuator/health"
wait_for "api-gateway" "$API_URL/actuator/health"
wait_for "smms-frontend" "$FRONTEND_URL/health"
