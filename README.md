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

The preinstall hook will create a new Solana keypair in the keypairs directory. You can use your own keypair file by appending `--authorityKeypair="keypair path"` to any command but you will need to use the same keypair throughout that you used to create any accounts.

## Simple Example

The simple example will build an oracle queue with a crank then add an aggregator with a single job that will fetch the price of SOL/USD from FTX.com. You will then be prompted to spin up a docker container with your newly created Oracle account to fulfill the update request.

```bash
npm start
```
