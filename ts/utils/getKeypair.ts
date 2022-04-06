import { Keypair } from "@solana/web3.js";
import fs from "fs";

export const getKeypair = (path: string): Keypair => {
  if (!fs.existsSync(path)) {
    throw new Error(`failed to load authority keypair from ${path}`);
  }
  const keypairString = fs.readFileSync(path, "utf8");
  const keypairBuffer = new Uint8Array(JSON.parse(keypairString));
  const walletKeypair = Keypair.fromSecretKey(keypairBuffer);
  return walletKeypair;
};
