import { CrankAccount } from "@switchboard-xyz/switchboard-v2";
import * as anchor from "@project-serum/anchor";
import { readSecretKey } from "../../utils";

export function loadCrankAccount(
  fileName: string,
  program: anchor.Program
): CrankAccount | null {
  const keypair = readSecretKey(fileName);
  if (keypair) {
    try {
      const crankAccount = new CrankAccount({
        program,
        keypair,
      });
      return crankAccount;
    } catch (err) {
      console.error("error loading account", fileName, err);
    }
  }
  return null;
}
