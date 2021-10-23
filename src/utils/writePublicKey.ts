import { PublicKey } from "@solana/web3.js";
import { KEYPAIR_OUTPUT } from "../const";
import fs from "fs";

export const writePublicKey = (fName: string, pubkey: PublicKey): void => {
  fs.writeFileSync(`${KEYPAIR_OUTPUT}/${fName}.txt`, `${pubkey.toString()}`);
};
