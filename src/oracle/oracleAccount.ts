import {
  OracleAccount,
  OracleQueueAccount,
} from "@switchboard-xyz/switchboard-v2";
import * as anchor from "@project-serum/anchor";
import { writeSecretKey } from "../utils/writeSecretKey";
import { readSecretKey } from "../utils/readSecretKey";
import { writePublicKey } from "../utils/writePublicKey";
import { readPublicKey } from "../utils/readPublicKey";

export const getOracleAccount = async (
  program: anchor.Program,
  queueAccount: OracleQueueAccount
): Promise<OracleAccount> => {
  // try to read file, if not found create
  const fName = "oracle_account";
  const readKey = readPublicKey(fName);
  if (readKey) {
    try {
      const oracleAccount = new OracleAccount({
        program,
        publicKey: readKey,
      });
      console.log(`loaded ${fName} from local storage`);
      return oracleAccount;
    } catch (err) {
      console.error(err);
    }
  }

  const oracleAccount = await OracleAccount.create(program, {
    queueAccount,
  });
  if (oracleAccount?.publicKey) {
    console.log(`saving ${fName}`);
    writePublicKey(fName, oracleAccount?.publicKey);
  }
  console.log(`created ${fName}`);
  return oracleAccount;
};
