import chalk from "chalk";
import { SwitchboardAccount } from "../cli/types";

export const toAccountString = (
  label: string,
  account: SwitchboardAccount | string
): string => {
  if (typeof account === "string") {
    return `${chalk.blue(label.padEnd(24, " "))} ${chalk.yellow(account)}`;
  }
  if (!account.publicKey) return "";
  return `${chalk.blue(label.padEnd(24, " "))} ${chalk.yellow(
    account.publicKey
  )}`;
};
