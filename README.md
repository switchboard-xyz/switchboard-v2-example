# Switchboard V2 Examples

Example repo for working with Switchboard V2. This script will digest **oracleQueue.definition.json** and create the neccesary on-chain accounts and output **oracleQueue.schema.json**. Subsequent runs will use the local schema file.

## Environment

```env
PID=""              ## PID of the on-chain program
RPC_URL="https://api.devnet.solana.com"
ORACLE_KEY=""       ## Oracle Pubkey used for docker image
```

You will also need the following files in the root directory

- authority-keypair.json (on-chain authority)
- switchboard_v2.json (anchor IDL)


## Install

```bash
npm install
```

## Start

```bash
npm run start
```

