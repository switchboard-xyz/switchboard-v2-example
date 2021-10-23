import { PublicKey } from "@solana/web3.js";
import chalk from "chalk";

export const toAccountString = (
  label: string,
  publicKey: PublicKey
): string => {
  return `${chalk.blue(label.padEnd(24, " "))} ${chalk.yellow(publicKey)}`;
};
