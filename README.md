# Switchboard V2 Examples

Example repo for working with Switchboard V2. This script will digest **oracleQueue.definition.json** and create the neccesary on-chain accounts and output **oracleQueue.schema.json**. Subsequent runs will use the local schema file.

## Environment

```env
PID=""              ## PID of the on-chain program
RPC_URL=""          ## RPC Server to process your request
ORACLE_KEY=""       ## Oracle Pubkey needed after initial account creation
```

## Solana Keypairs

You will need a Solana keypair with an active balance to fund new accounts

```bash
solana-keygen new --outfile keypairs/authority-keypair.json
solana airdrop 5 keypairs/authority-keypair.json
```

## Install

```bash
npm install
```

## Start

```bash
npm run start
```

or you can provide your own keypair file

```bash
ts-node src/main.ts --authorityKeypair=keypairs/solana-keypair.json
```

## Oracle

After running, set the ORACLE_KEY in your .env file or hardcode into docker-compose.yml

NOTE: Make sure the PAYER_SECRETS file in the docker-compose image matches the keypair used to create the accounts

```bash
docker-compose up
```
