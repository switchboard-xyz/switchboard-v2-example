import { Keypair } from "@solana/web3.js";
import { KEYPAIR_OUTPUT } from "../types/const";
import fs from "fs";

// TO DO: Should throw error if file already exists
export const writeSecretKey = (fileName: string, keypair: Keypair): void => {
  fs.writeFileSync(
    `${KEYPAIR_OUTPUT}/${fileName}.json`,
    `[${keypair.secretKey}]`
  );
};
