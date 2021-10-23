# Switchboard V2 Examples

Example repo for working with Switchboard V2

## Environment

```env
RPC_URL="https://api.devnet.solana.com"
```

## Create payer account to pay for transactions

```bash
solana-keygen new --outfile ./keypairs/payer-keypair.json
solana airdrop 5 ./keypairs/payer-keypair.json
```
