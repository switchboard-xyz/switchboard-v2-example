import { Keypair } from "@solana/web3.js";
import { KEYPAIR_OUTPUT } from "../types/const";
import fs from "fs";

export const readSecretKey = (fileName: string): Keypair | null => {
  const fullName = `${KEYPAIR_OUTPUT}/${fileName}.json`;
  if (!fs.existsSync(fullName)) return null;
  try {
    const keypairString = fs.readFileSync(fullName, "utf8");
    const keypairBuffer = new Uint8Array(JSON.parse(keypairString));
    const walletKeypair = Keypair.fromSecretKey(keypairBuffer);
    return walletKeypair;
  } catch (err) {
    console.error(err);
    return null;
  }
};
