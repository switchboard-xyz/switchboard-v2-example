# Switchboard V2 Examples


This repo includes the following
- Simple example to setup a queue and add an aggregator [example.ts](ts/example/main.ts)
- Interactive example that will build a queue and persist your changes
- Two on-chain examples for reading an aggregator
    - [Anchor Feed Parser](rust/anchor-feed-parser/programs/anchor-feed-parser/src/lib.rs)
    - [On-Chain Feed Parser](rust/on-chain-feed-parser/src/lib.rs)

## Dependencies

You will need the following installed

- [Node and NPM](https://github.com/nvm-sh/nvm#installing-and-updating)
- [Docker Compose](https://docs.docker.com/compose/install)
- [Rust](https://www.rust-lang.org/tools/install)
- [Solana](https://docs.solana.com/cli/install-solana-cli-tools)
- [Anchor](https://project-serum.github.io/anchor/getting-started/installation.html#install-anchor)

## Install

```bash
npm install
```

The preinstall hook will create a new Solana keypair in the keypairs directory. You can use your own keypair file by appending `--authorityKeypair="keypair path"` to any command but you will need to use the same keypair throughout that you used to create any accounts.


## Simple Example

The simple example will build an oracle queue with a crank then add an aggregator with a single job that will fetch the price of SOL/USD from FTX.com. You will then be prompted to spin up a docker container with your newly created Oracle account to fulfill the update request.

```bash
npm run example
```

## Interactive Example

The interactive example allows you to build more complex examples and persist your changes for future runs. When run, it will read in the definition file, create any necessary switchboard accounts, then save the keypairs to a schema file. NOTE: This is strictly for demostration purposes, storing keypairs like this is not recommended.

### Start

First we need to create the necessary switchboard accounts:

```bash
npm run setup:cli
```

Now we have a schema file to quickly rebuild our accounts next time we run any scripts.

### Oracle
Next we need to startup an oracle to process any updates. This will start the docker container using the oracle.env that was created with the schema:

```bash
npm run start:oracle
```

### Crank

With the oracle running, we need to turn the crank and give it some jobs to fulfill:

```bash
npm run crank:turn
```

### Other Actions

- `npm run start`  interactive interface to perform different actions
- `npm run crank:watch` turn the crank every 15seconds
- `npm run aggregator:watch` log anytime an aggregator was updated
- `npm run airdrop:authority` refund your keypair with more devnet funds

## On-Chain

Now lets see the result on-chain! Run the following command to build and deploy the on-chain program that will read our aggregator result:

```bash
npm run setup:anchor
```

Now lets read the result of SOL/USD on-chain:

```bash
npm run test:anchor
```

This will read in our schema file, find the public key of the SOL/USD aggregator, then pass it as an instruction to our on-chain program to read. And just like that we have deployed our own oracle infrastructure on Solana and consumed its data on-chain.
