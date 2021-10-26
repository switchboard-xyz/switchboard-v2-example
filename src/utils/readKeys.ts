import { Keypair, PublicKey } from "@solana/web3.js";
import fs from "fs";
import { getFullSubdirectoryPath } from ".";

export const readSecretKey = (
  fileName: string,
  subdirectory?: string[]
): Keypair | null => {
  const fullFileName = `${getFullSubdirectoryPath(
    subdirectory
  )}/${fileName}.json`;
  if (!fs.existsSync(fullFileName)) return null;

  try {
    const keypairString = fs.readFileSync(fullFileName, "utf8");
    const keypairBuffer = new Uint8Array(JSON.parse(keypairString));
    const walletKeypair = Keypair.fromSecretKey(keypairBuffer);
    return walletKeypair;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const readPublicKey = (
  fileName: string,
  subdirectory?: string[]
): PublicKey | null => {
  const fullFileName = `${getFullSubdirectoryPath(
    subdirectory
  )}/${fileName}.txt`;
  if (!fs.existsSync(fullFileName)) return null;

  try {
    const pubkeyString = fs.readFileSync(fullFileName, "utf8");
    const pubkey = new PublicKey(pubkeyString);
    return pubkey;
  } catch (err) {
    console.error("error reading pub key", fileName, err);
    return null;
  }
};
