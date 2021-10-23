import {
  CrankAccount,
  OracleQueueAccount,
} from "@switchboard-xyz/switchboard-v2";
import * as anchor from "@project-serum/anchor";
import { writeSecretKey } from "../../utils/writeSecretKey";
import { readSecretKey } from "../../utils/readSecretKey";

export const getCrankAccount = async (
  program: anchor.Program,
  oracleQueueAccount: OracleQueueAccount
): Promise<CrankAccount> => {
  const fName = "crank_account";
  const readKey = readSecretKey(fName);
  if (readKey) {
    try {
      const crankAccount = new CrankAccount({
        program,
        keypair: readKey,
      });
      console.log(`loaded ${fName} from local storage`);
      return crankAccount;
    } catch (err) {
      console.error("error loading account", fName, err);
    }
  }
  const crankAccount = await CrankAccount.create(program, {
    name: Buffer.from("crank1"),
    metadata: Buffer.from(""),
    queueAccount: oracleQueueAccount,
    maxRows: 100,
  });
  if (crankAccount?.keypair) {
    writeSecretKey(fName, crankAccount?.keypair);
  }

  return crankAccount;
};
