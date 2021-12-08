# Switchboard V2 Examples

This repo includes the following

- Simple example to setup a queue and add an aggregator [example.ts](ts/example/main.ts)
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

The preinstall hook will create a new Solana keypair in the keypairs directory. You can use your own keypair file by appending `--authorityKeypair="keypair path"` to any command but you should use the same keypair throughout.

## Full Example

The simple example will build an oracle queue with a crank then add an aggregator with a single job that will fetch the price of SOL/USD from FTX.com. You will then be prompted to spin up a docker container with your newly created Oracle account to fulfill the update request.

```
USAGE
  $ ts-node ts/main full-example

ARGUMENTS


OPTIONS
  --authorityKeypair    filesystem path of keypair that will have authority of new accounts

EXAMPLE
  $ ts-node ts/main full-example --authorityKeypair=keypairs/authority-keypair.json
```

## Create Aggregator from JSON

```
USAGE
  $ ts-node ts/main create-aggregator [CRANKKEY] [DEFINITIONFILE] [OUTFILE]

ARGUMENTS
  CRANKKEY            public key of the crank you intent to join
  DEFINITIONFILE      filesystem path of aggeregator definition file
  OUTFILE             filesystem path to save the new accounts

OPTIONS
  --authorityKeypair  filesystem path of keypair that will have authority of new accounts

EXAMPLE
  $ ts-node ts/main create-aggregator HX2oLYGqThai8i6hvEm9B4y5pAkLXLyryps13195BSAz accounts/sample.definition.aggregator.json accounts/schema.aggregator.json
```

## Create Your Own Oracle Queue

```
USAGE
  $ ts-node ts/main create-personal-queue [QUEUEDEFINITION] [OUTFILE]

ARGUMENTS
  QUEUEDEFINITION     filesystem path of oracle queue definition file
  OUTFILE             filesystem path to save the schema file

OPTIONS
  --authorityKeypair  filesystem path of keypair that will have authority of new accounts

EXAMPLE
  $ ts-node ts/main create-personal-queue accounts/sample.definition.queue.json accounts/schema.queue.json
```

## Add Aggregator to Personal Queue

```
USAGE
  $ ts-node ts/main create-personal-aggregator [QUEUESCHEMAFILE] [AGGREGATORDEFINITION]

ARGUMENTS
  QUEUESCHEMAFILE       filesystem path of oracle queue schema file to load accounts from
  AGGREGATORDEFINITION  filesystem path to json file containing the aggregator definition

OPTIONS
  --authorityKeypair    filesystem path of keypair that will have authority of new accounts

EXAMPLE
  $ ts-node ts/main create-personal-aggregator accounts/schema.queue.json accounts/sample.definition.aggregator.json
```
