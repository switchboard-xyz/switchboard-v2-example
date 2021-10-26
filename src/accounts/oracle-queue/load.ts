import { OracleQueueAccount } from "@switchboard-xyz/switchboard-v2";
import * as anchor from "@project-serum/anchor";

import { readSecretKey } from "../../utils";

export function loadOracleQueueAccount(
  program: anchor.Program
): OracleQueueAccount | null {
  const fileName = "oracle_queue";
  const keypair = readSecretKey(fileName);
  if (keypair) {
    try {
      const oracleQueueAccount = new OracleQueueAccount({
        program,
        keypair,
      });
      return oracleQueueAccount;
    } catch (err) {
      console.error("error loading account", fileName, err);
    }
  }
  return null;
}
