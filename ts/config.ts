import dotenv from "dotenv";
dotenv.config();

const DEFAULT_RPC = "https://api.devnet.solana.com";

export const RPC_URL = process.env.RPC_URL || DEFAULT_RPC;

if (RPC_URL === DEFAULT_RPC) {
  console.log("Default RPC Server:", RPC_URL);
} else {
  console.log("RPC Server:", RPC_URL);
}

export const KEYPAIR_OUTPUT = process.env.KEYPAIR_OUTPUT
  ? `keypairs-${process.env.KEYPAIR_OUTPUT}` // use prefix for gitignore glob pattern
  : "keypairs"; // root
