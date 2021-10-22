import dotenv from "dotenv";
dotenv.config();

export const RPC_POOL = process.env.RPC_POOL
  ? process.env.RPC_POOL
  : "https://api.devnet.solana.com";
