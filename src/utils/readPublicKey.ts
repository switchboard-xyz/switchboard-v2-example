import { Keypair, PublicKey } from "@solana/web3.js";
import { KEYPAIR_OUTPUT } from "../types/const";
import fs from "fs";

export const readPublicKey = (fName: string): PublicKey | null => {
  const fullName = `${KEYPAIR_OUTPUT}/${fName}.txt`;
  if (!fs.existsSync(fullName)) return null;
  try {
    const pubkeyString = fs.readFileSync(fullName, "utf8");
    const pubkey = new PublicKey(pubkeyString);
    return pubkey;
  } catch (err) {
    console.error("error reading pub key", fName, err);
    return null;
  }
};
