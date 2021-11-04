import { Keypair, PublicKey } from "@solana/web3.js";
import fs from "node:fs";
import { getFullSubdirectoryPath } from ".";

export const readSecretKey = (
  fileName: string,
  subdirectory?: string[]
): Keypair | undefined => {
  const fullFileName = `${getFullSubdirectoryPath(
    subdirectory
  )}/${fileName}.json`;
  if (!fs.existsSync(fullFileName)) return undefined;

  try {
    const keypairString = fs.readFileSync(fullFileName, "utf8");
    const keypairBuffer = new Uint8Array(JSON.parse(keypairString));
    const walletKeypair = Keypair.fromSecretKey(keypairBuffer);
    return walletKeypair;
  } catch (error) {
    console.error(error);
    return undefined;
  }
};

export const readPublicKey = (
  fileName: string,
  subdirectory?: string[]
): PublicKey | undefined => {
  const fullFileName = `${getFullSubdirectoryPath(
    subdirectory
  )}/${fileName}.txt`;
  if (!fs.existsSync(fullFileName)) return undefined;

  try {
    const pubkeyString = fs.readFileSync(fullFileName, "utf8");
    const pubkey = new PublicKey(pubkeyString);
    return pubkey;
  } catch (error) {
    console.error("error reading pub key", fileName, error);
    return undefined;
  }
};
