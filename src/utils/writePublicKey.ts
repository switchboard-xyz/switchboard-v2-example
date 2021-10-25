import { PublicKey } from "@solana/web3.js";
import { KEYPAIR_OUTPUT } from "../types/const";
import fs from "fs";

export const writePublicKey = (fileName: string, pubkey: PublicKey): void => {
  if (!fs.existsSync(KEYPAIR_OUTPUT)) fs.mkdirSync(KEYPAIR_OUTPUT);
  fs.writeFileSync(`${KEYPAIR_OUTPUT}/${fileName}.txt`, `${pubkey.toString()}`);
};
