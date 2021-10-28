export const RPC_URL = process.env.RPC_URL
  ? process.env.RPC_URL
  : "https://api.devnet.solana.com";

export const KEYPAIR_OUTPUT = process.env.KEYPAIR_OUTPUT
  ? `keypairs-${process.env.KEYPAIR_OUTPUT}` // use prefix for gitignore glob pattern
  : "."; // root

export const PROGRAM_ID = process.env.PID
  ? process.env.PID
  : "3HxY6BPXLmfB9ktCBxXrVXudg2rksmfSTNvtxcUud9Kc";
