import { SwitchboardAccount } from "../types";
import chalk from "chalk";

export const toAccountString = (
  label: string,
  account: SwitchboardAccount
): string => {
  if (!account.publicKey) return "";
  return `${chalk.blue(label.padEnd(24, " "))} ${chalk.yellow(
    account.publicKey
  )}`;
};
