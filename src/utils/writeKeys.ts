import { Keypair, PublicKey } from "@solana/web3.js";
import { KEYPAIR_OUTPUT, SwitchboardAccount } from "../types";
import fs from "fs";
import chalk from "chalk";

export const writeKeys = (
  fileName: string,
  account: SwitchboardAccount
): void => {
  if (account.keypair) {
    writeSecretKey(fileName, account.keypair);
    return; // if we have secret key, we can get public key
  }
  if (account.publicKey) {
    writePublicKey(fileName, account.publicKey);
  }
};

// TO DO: Should throw error if file already exists
export const writeSecretKey = (
  fileName: string,
  keypair: Keypair | undefined
): void => {
  if (!keypair) return;
  const fullFileName = `${KEYPAIR_OUTPUT}/${fileName}.json`;
  if (!fs.existsSync(KEYPAIR_OUTPUT)) fs.mkdirSync(KEYPAIR_OUTPUT);
  if (!fs.existsSync(fullFileName)) {
    fs.writeFileSync(
      `${KEYPAIR_OUTPUT}/${fileName}.json`,
      `[${keypair.secretKey}]`
    );
    console.log(`${chalk.green("Created:")} ${fullFileName}`);
  } else {
    console.log(`${chalk.red("Existing:")} ${fullFileName}`);
  }
};

export const writePublicKey = (
  fileName: string,
  pubkey: PublicKey | undefined
): void => {
  if (!pubkey) return;
  const fullFileName = `${KEYPAIR_OUTPUT}/${fileName}.txt`;
  if (!fs.existsSync(KEYPAIR_OUTPUT)) fs.mkdirSync(KEYPAIR_OUTPUT);
  if (!fs.existsSync(fullFileName)) {
    fs.writeFileSync(fullFileName, `${pubkey.toString()}`);
    console.log(`${chalk.green("Created:")} ${fullFileName}`);
  } else {
    console.log(`${chalk.red("Existing:")} ${fullFileName}`);
  }
};
