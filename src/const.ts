import dotenv from "dotenv";
dotenv.config();

export const RPC_URL = process.env.RPC_URL
  ? process.env.RPC_URL
  : "https://api.devnet.solana.com";

export const KEYPAIR_OUTPUT = "keypairs";
