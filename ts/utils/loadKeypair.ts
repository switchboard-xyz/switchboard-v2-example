import { Keypair } from "@solana/web3.js";
import fs from "fs";

export const loadKeypair = (path: string): Keypair | undefined => {
  if (!fs.existsSync(path)) return undefined;
  const keypairString = fs.readFileSync(path, "utf8");
  const keypairBuffer = new Uint8Array(JSON.parse(keypairString));
  const walletKeypair = Keypair.fromSecretKey(keypairBuffer);
  return walletKeypair;
};
