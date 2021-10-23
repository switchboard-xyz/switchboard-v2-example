import { Keypair } from "@solana/web3.js";
import { KEYPAIR_OUTPUT } from "../const";
import fs from "fs";

export const writeSecretKey = (fName: string, keypair: Keypair): void => {
  fs.writeFileSync(`${KEYPAIR_OUTPUT}/${fName}.json`, `[${keypair.secretKey}]`);
};
