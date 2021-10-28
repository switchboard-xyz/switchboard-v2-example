import { Keypair, PublicKey } from "@solana/web3.js";
import chalk from "chalk";
import fs from "fs";
import { getFullSubdirectoryPath } from ".";
import { KEYPAIR_OUTPUT, SwitchboardAccount } from "../types";

export const writeKeys = (
  fileName: string,
  account: SwitchboardAccount,
  subdirectory?: string[]
): void => {
  if (account.keypair) {
    writeSecretKey(fileName, account.keypair, subdirectory);
    return; // if we have secret key, we can get public key
  }
  if (account.publicKey) {
    writePublicKey(fileName, account.publicKey, subdirectory);
  }
};

// TO DO: Should throw error if file already exists
export const writeSecretKey = (
  fileName: string,
  keypair: Keypair | undefined,
  subdirectory?: string[]
): void => {
  if (!keypair) return;
  const fullFileName = `${getFullSubdirectoryPath(
    subdirectory
  )}/${fileName}.json`;

  if (!fs.existsSync(KEYPAIR_OUTPUT)) fs.mkdirSync(KEYPAIR_OUTPUT);
  if (subdirectory && !fs.existsSync(`${KEYPAIR_OUTPUT}/${subdirectory}`))
    fs.mkdirSync(`${KEYPAIR_OUTPUT}/${subdirectory}`);

  if (!fs.existsSync(fullFileName)) {
    fs.writeFileSync(fullFileName, `[${keypair.secretKey}]`);
    console.log(`${chalk.green("Created:")} ${fullFileName}`);
  } else {
    console.log(`${chalk.red("Existing:")} ${fullFileName}`);
  }
};

export const writePublicKey = (
  fileName: string,
  pubkey: PublicKey | undefined,
  subdirectory?: string[]
): void => {
  if (!pubkey) return;
  const fullFileName = `${getFullSubdirectoryPath(
    subdirectory
  )}/${fileName}.txt`;

  if (!fs.existsSync(KEYPAIR_OUTPUT)) fs.mkdirSync(KEYPAIR_OUTPUT);
  if (subdirectory && !fs.existsSync(`${KEYPAIR_OUTPUT}/${subdirectory}`))
    fs.mkdirSync(`${KEYPAIR_OUTPUT}/${subdirectory}`);

  if (!fs.existsSync(fullFileName)) {
    fs.writeFileSync(fullFileName, `${pubkey.toString()}`);
    console.log(`${chalk.green("Created:")} ${fullFileName}`);
  } else {
    console.log(`${chalk.red("Existing:")} ${fullFileName}`);
  }
};
