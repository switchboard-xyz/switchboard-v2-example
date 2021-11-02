# Switchboard V2 Examples

Example repo for working with Switchboard V2. This script will digest **oracleQueue.definition.json** and create the neccesary on-chain accounts and output **oracleQueue.schema.json**. Subsequent runs will use the local schema file.

## Install

```bash
npm install
```

## Setup

```bash
npm run setup
```

This script does the following:

- Creates necessary keypairs and airdrops devnet Solana
- Builds and Deploys an on-chain program that we'll use later
- Creates an Oracle queue, a Crank, and Oracles as defined in the definition json file
- Outputs the Switchboard accounts to a schema json to load quicker next run

## Oracle

After running, set the ORACLE_KEY in your .env file or hardcode into docker-compose.yml

```bash
docker-compose up
```
