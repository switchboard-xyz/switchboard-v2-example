# Switchboard V2 Examples

This repo provides some examples for working with Switchboard V2, including:

- Two on-chain examples for reading an aggregator onchain
  - [Anchor Feed Parser](rust/anchor-feed-parser/programs/anchor-feed-parser/src/lib.rs)
  - [On-Chain Feed Parser](rust/on-chain-feed-parser/src/lib.rs)
- End-to-End example detailing how to initiate a queue, add your own aggregator, and fulfill update request
- How to create a custom aggregator

## Table of Contents

- [Dependencies](#Dependencies)
- [Install](#Install)
- [Examples](#Examples)
  - [Deploy & Run Onchain Programs](#deploy--run-onchain-programs)
  - [End-to-End Example](#end-to-end-example)
  - [Create your own Queue](#create-your-own-queue)
  - [Create & Approve Custom Aggregator](#create--approve-custom-aggregator)
- [Commands](#Commands)
  - [End-to-End Example](#full-example)
  - [Create Aggregator from JSON](#create-aggregator-from-json)
  - [Create your own Oracle Queue](#create-your-own-oracle-queue)
  - [Add Aggregator to your own Queue](#add-aggregator-to-personal-queue)
  - [Turn the Crank](#turn-crank)
  - [Request Aggregator Update](#request-aggregator-update)
  - [Read Anchor Program](#read-anchor-program)

## Dependencies

You will need the following installed

- [Node and NPM](https://github.com/nvm-sh/nvm#installing-and-updating)
- [Docker Compose](https://docs.docker.com/compose/install)
- [Rust](https://www.rust-lang.org/tools/install)\*
- [Solana](https://docs.solana.com/cli/install-solana-cli-tools)\*
- [Anchor](https://project-serum.github.io/anchor/getting-started/installation.html#install-anchor)\*

\* dependency only needed if you are deploying the provided onchain program examples

## Install

```bash
git clone https://github.com/switchboard-xyz/switchboard-v2-example.git
cd switchboard-v2-example
npm install
npm link
npm run setup:authority
```

The preinstall hook will create a new Solana keypair in the keypairs directory. You can use your own keypair file by appending `--authorityKeypair="keypair path"` to any command but you should use the same keypair throughout.

## Examples

### Deploy & Run Onchain Programs

Deploy onchain programs then pass the programs an aggregator to parse

```bash
npm run build
# cd rust/anchor-feed-parser && ${HOME}/.cargo/bin/anchor build
# cargo build-bpf --manifest-path=rust/on-chain-feed-parser/Cargo.toml
```

```bash
sbv2-example read-anchor 8SXvChNYFhRq4EZuZvnhjrB3jJRQCv4k3P4W6hesH3Ee
```

### End-to-End Example

Run the full example which creates a queue, crank, oracle, & aggregator, then allows you to spin up an oracle, turn the crank, and read the latest result.

```bash
sbv2-example full-example
```

When prompted, open another terminal and startup the docker container to process your new aggregator. The command will look something like this:

```bash
ORACLE_KEY=<YOUR NEW ORACLE KEY> docker-compose up
```

Hit 'Y' to continue. The example will turn the crank and send your new aggregator to your oracle to fulfill.

And just like that you have created your own switchboard network and sent an update event to your oracle account, then posted the result onchain.

### Create your own Queue

Edit `sample.definition.queue.json` with the name of your queue. If you edit `minStake`, you will need to fund your oracles with wrapped SOL to succesfully heartbeat onchain, recommend leaving this as 0.

Then run the following command to spin up your queue

```bash
sbv2-example create-personal-queue sample.definition.queue.json secrets/schema.queue.json
```

Now add an aggregator to your queue

```bash
sbv2-example create-personal-aggregator secrets/schema.queue.json sample.definition.aggregator.json
```

### Create & Approve Custom Aggregator

Create an aggregator from a JSON file then get it approved to join an existing queue.

```bash
sbv2-example create-aggregator B4yBQ3hYcjnrNLxUnauJqwpFJnjtm7s8gHybgkAdgXhQ sample.definition.aggregator.json secrets/schema.aggregator.json
```

You will then need to submit your aggregator public key to the queue authority to be approved.

## Commands

The following contain a list of commands available in this repo. Check out Switchboardv2-cli for additional functionality.

### Full Example

The simple example will build an oracle queue with a crank then add an aggregator with a single job that will fetch the price of SOL/USD from FTX.com. You will then be prompted to spin up a docker container with your newly created Oracle account to fulfill the update request.

```
USAGE
  $ sbv2-example full-example

ARGUMENTS


OPTIONS
  --authorityKeypair    filesystem path of keypair that will have authority of new accounts and pay for onchain transactions
  -f, --force           overwrite any outputted files

EXAMPLE
  $ sbv2-example full-example --authorityKeypair=secrets/authority-keypair.json
```

### Create Aggregator from JSON

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
  $ sbv2-example create-aggregator B4yBQ3hYcjnrNLxUnauJqwpFJnjtm7s8gHybgkAdgXhQ sample.definition.aggregator.json secrets/schema.aggregator.json
```

### Create Your Own Oracle Queue

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

### Add Aggregator to Personal Queue

Add an aggregator to an oracle queue you are the authority for.

```
USAGE
  $ sbv2-example create-personal-aggregator [QUEUESCHEMAFILE] [AGGREGATORDEFINITION] CRANKNAME

ARGUMENTS
  QUEUESCHEMAFILE       filesystem path of oracle queue schema file to load accounts from
  AGGREGATORDEFINITION  filesystem path of JSON file containing the aggregator definition
  CRANKNAME             optional, name of the crank to add aggregator to. If not provided, aggregator is added to the first crank

OPTIONS
  --authorityKeypair    filesystem path of keypair that will have authority of new accounts and pay for onchain transactions
  -f, --force           overwrite any outputted files

EXAMPLE
  $ sbv2-example create-personal-aggregator secrets/schema.queue.json sample.definition.aggregator.json
```

### Turn Crank

Turn the crank.

```
USAGE
  $ sbv2-example crank-turn [CRANKKEY]

ARGUMENTS
  CRANKKEY              public key of the crank to turn

OPTIONS
  --authorityKeypair    filesystem path of keypair that will have authority of new accounts and pay for onchain transactions
  -f, --force           overwrite any outputted files

EXAMPLE
  $ sbv2-example crank-turn 2xTBfDywp21dtj4w4QWZTR7SyfyMz6eMz3z34C3kxwbz
```

### Request Aggregator Update

Request a new update round for a given aggregator.

```
USAGE
  $ sbv2-example update-aggregator [AGGREGATORKEY]

ARGUMENTS
  AGGREGATORKEY              public key of the aggregator account to request an update from

OPTIONS
  --authorityKeypair    filesystem path of keypair that will have authority of new accounts and pay for onchain transactions
  -f, --force           overwrite any outputted files

EXAMPLE
  $ sbv2-example update-aggregator 8SXvChNYFhRq4EZuZvnhjrB3jJRQCv4k3P4W6hesH3Ee
```

### Read Anchor Program

Read an aggregator account result from a deployed anchor program.

```
USAGE
  $ sbv2-example read-anchor [AGGREGATORKEY]

ARGUMENTS
  AGGREGATORKEY       public key of the aggregator account to read latest result from

OPTIONS
  --authorityKeypair    filesystem path of keypair that will have authority of new accounts and pay for onchain transactions
  -f, --force           overwrite any outputted files

EXAMPLE
  $ sbv2-example read-anchor 8SXvChNYFhRq4EZuZvnhjrB3jJRQCv4k3P4W6hesH3Ee
```
