# Switchboard V2 Examples

Example repo for working with Switchboard V2. This script will digest **oracleQueue.definition.json** and create the neccesary on-chain accounts and output **oracleQueue.schema.json**. Subsequent runs will use the local schema file.

## Install

```bash
npm ci
```

This script completes the following:

- Creates Solana keypair and funds account with devnet tokens
- Builds and Deploys two on-chain program that we'll use to read our data feeds
  - Anchor
  - Solana Library
- Creates an Oracle Queue based on the definition file
- Saves the Switchboard accounts to a schema json for quicker subsequent runs

## Oracle

After running, set the ORACLE_KEY in your .env file or hardcode into docker-compose.yml

```bash
docker-compose up
```

## Crank

With the oracle running, we need to turn the crank and give it some jobs to fulfill

```bash
npm run switchboard:crank
```

## Test

Now lets see the result on-chain!

```bash
npm run test:onchain
```
