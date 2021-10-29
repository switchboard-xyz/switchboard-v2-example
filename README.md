# Switchboard V2 Examples

Example repo for working with Switchboard V2. This script will digest **oracleQueue.definition.json** and create the neccesary on-chain accounts and output **oracleQueue.schema.json**. Subsequent runs will use the local schema file.

## Environment

```env
PID=""              ## PID of the on-chain program
RPC_URL="https://api.devnet.solana.com"
ORACLE_KEY=""       ## Oracle Pubkey used for docker image
```

You will also need a Solana keypair with an active balance to fund new accounts

```bash
solana-keygen new --outfile authority-keypair.json
solana airdrop 5 authority-keypair.json
```


## Install

```bash
npm install
```

## Start

```bash
npm run start
```

## Oracle
After running, set the ORACLE_KEY in your .env file or hardcode into docker-compose.yml

```bash
docker-compose up
```
