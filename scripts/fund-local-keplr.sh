#!/usr/bin/env bash
# Fund a Keplr address on local testnet (chain-id testing).
# Usage: ./scripts/fund-local-keplr.sh orai1...
set -euo pipefail

TO="${1:-}"
if [[ -z "$TO" ]]; then
  echo "Usage: $0 <orai1-address>"
  exit 1
fi

HOME1="${HOME}/.oraid/validator1"
NODE="tcp://127.0.0.1:26657"
CHAIN_ID="testing"

oraid tx bank send validator1 "$TO" 1000000000orai \
  --from validator1 \
  --home "$HOME1" \
  --keyring-backend test \
  --chain-id "$CHAIN_ID" \
  --node "$NODE" \
  --fees 2000orai \
  --gas 200000 \
  -y

echo "Sent 1000 ORAI to $TO"
oraid q bank balances "$TO" --node "$NODE"
