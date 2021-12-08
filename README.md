# Switchboard V2 Examples

This repo includes the following

- End-to-End example to setup a queue and add an aggregator
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
npm link
```

The preinstall hook will create a new Solana keypair in the keypairs directory. You can use your own keypair file by appending `--authorityKeypair="keypair path"` to any command but you should use the same keypair throughout.

## Full Example

The simple example will build an oracle queue with a crank then add an aggregator with a single job that will fetch the price of SOL/USD from FTX.com. You will then be prompted to spin up a docker container with your newly created Oracle account to fulfill the update request.

```
USAGE
  $ sbv2-example full-example

ARGUMENTS


OPTIONS
  --authorityKeypair    filesystem path of keypair that will have authority of new accounts
  -f, --force           overwrite any outputted files

EXAMPLE
  $ sbv2-example full-example --authorityKeypair=secrets/authority-keypair.json
```

## Create Aggregator from JSON

Create a new aggregator account from a JSON definition file.

```
USAGE
  $ sbv2-example create-aggregator [QUEUEKEY] [DEFINITIONFILE] [OUTFILE]

ARGUMENTS
  QUEUEKEY            public key of the oracle queue that the aggregator will belong to
  DEFINITIONFILE      filesystem path of JSON file containing the aggregator definition
  OUTFILE             filesystem path to store the aggregator schema to quickly load and manage an aggregator

OPTIONS
  --authorityKeypair  filesystem path of keypair that will have authority of new accounts
  -f, --force         overwrite any outputted files

EXAMPLE
  $ sbv2-example create-aggregator B4yBQ3hYcjnrNLxUnauJqwpFJnjtm7s8gHybgkAdgXhQ sample.definition.aggregator.json secrets/newschema.aggregator.json
```

## Create Your Own Oracle Queue

Create a new oracle queue for which you are the authority for.

```
USAGE
  $ sbv2-example create-personal-queue [QUEUEDEFINITION] [OUTFILE]

ARGUMENTS
  QUEUEDEFINITION     filesystem path of JSON file containing the oracle queue definition
  OUTFILE             filesystem path to store the oracle queue schema to quickly load and manage a queue

OPTIONS
  --authorityKeypair  filesystem path of keypair that will have authority of new accounts
  -f, --force         overwrite any outputted files

EXAMPLE
  $ sbv2-example create-personal-queue sample.definition.queue.json secrets/schema.queue.json
```

## Add Aggregator to Personal Queue

Add an aggregator to an oracle queue you are the authority for.

```
USAGE
  $ sbv2-example create-personal-aggregator [QUEUESCHEMAFILE] [AGGREGATORDEFINITION]

ARGUMENTS
  QUEUESCHEMAFILE       filesystem path of oracle queue schema file to load accounts from
  AGGREGATORDEFINITION  filesystem path of JSON file containing the aggregator definition

OPTIONS
  --authorityKeypair    filesystem path of keypair that will have authority of new accounts
  -f, --force           overwrite any outputted files

EXAMPLE
  $ sbv2-example create-personal-aggregator secrets/schema.queue.json sample.definition.aggregator.json
```
