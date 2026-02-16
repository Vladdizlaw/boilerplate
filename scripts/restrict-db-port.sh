#!/usr/bin/env bash
#
# Restrict access to port 5432 (PostgreSQL) to localhost only.
# Run on the SERVER (where Docker Swarm is running).
#
# After applying, DB connections are only possible:
# - via SSH tunnel: ssh -L 5432:localhost:5432 user@server
# - from the server itself: psql -h localhost -p 5432 ...
#
# Usage:
#   sudo ./scripts/restrict-db-port.sh        # apply rule
#   sudo ./scripts/restrict-db-port.sh --undo # remove rule
#

set -euo pipefail

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Run this script with sudo: sudo $0 $*"
  exit 1
fi

DPORT="${DB_PORT:-5432}"
IPTABLES_CHAIN="DOCKER-USER"
RULE="! -i lo -p tcp -m tcp --dport ${DPORT} -j DROP"

apply() {
  if iptables -C "$IPTABLES_CHAIN" $RULE 2>/dev/null; then
    echo "Rule for port ${DPORT} already exists."
    return 0
  fi
  iptables -I "$IPTABLES_CHAIN" 1 $RULE
  echo "Added: block connections to port ${DPORT} from any IP except localhost."
}

remove() {
  if ! iptables -C "$IPTABLES_CHAIN" $RULE 2>/dev/null; then
    echo "No rule for port ${DPORT}."
    return 0
  fi
  iptables -D "$IPTABLES_CHAIN" $RULE
  echo "Removed rule for port ${DPORT}."
}

save_rules() {
  if command -v netfilter-persistent >/dev/null 2>&1; then
    netfilter-persistent save 2>/dev/null || true
    echo "Rules saved (netfilter-persistent)."
  elif command -v iptables-save >/dev/null 2>&1 && [ -w /etc/iptables ]; then
    iptables-save > /etc/iptables/rules.v4 2>/dev/null || true
    echo "Rules saved to /etc/iptables/rules.v4."
  else
    echo "Tip: install iptables-persistent and save rules:"
    echo "  apt install -y iptables-persistent"
    echo "  netfilter-persistent save"
  fi
}

if [[ "${1:-}" == "--undo" ]]; then
  remove
  save_rules
  exit 0
fi

apply
save_rules
echo ""
echo "Check:"
iptables -L "$IPTABLES_CHAIN" -n -v | head -5
