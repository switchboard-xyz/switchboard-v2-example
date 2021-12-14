# On-Chain-Feed-Parser

## Deploy

```bash
cargo build-bpf --manifest-path=Cargo.toml
solana program deploy target/deploy/on_chain_feed_parser.so
```

## Run

```bash
ts-node tests/on-chain-feed-parser.ts --dataFeedPubkey={INSERT_YOUR_KEY_HERE} --programId={OUTPUT_FROM_PREVIOUS_STEP}
```
