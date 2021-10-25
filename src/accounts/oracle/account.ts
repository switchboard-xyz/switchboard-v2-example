import {
  OracleAccount,
  OracleQueueAccount,
} from "@switchboard-xyz/switchboard-v2";
import * as anchor from "@project-serum/anchor";
import {
  writePublicKey,
  readPublicKey,
  writeSecretKey,
  toAccountString,
  writeKeys,
} from "../../utils";
import { ConfigError } from "../../types";
import { loadAnchor } from "../../anchor";
import { getOracleQueue } from "../";

/**
 * checks for public key file and if not found creates PDA account of oracle queue
 * @returns oracle account
 */
export const getOracleAccount = async (
  program?: anchor.Program,
  queueAccount?: OracleQueueAccount
): Promise<OracleAccount> => {
  const anchorProgram = program ? program : await loadAnchor();
  const oracleQueueAccount = queueAccount
    ? queueAccount
    : await getOracleQueue();
  if (!oracleQueueAccount)
    throw new ConfigError("queueAccount not created yet");

  const fileName = "oracle_account";
  const readKey = readPublicKey(fileName);
  if (readKey) {
    try {
      const oracleAccount = new OracleAccount({
        program: anchorProgram,
        publicKey: readKey,
      });
      console.log(
        "Local:".padEnd(8, " "),
        toAccountString(fileName, oracleAccount.publicKey)
      );
      return oracleAccount;
    } catch (err) {
      console.error(err);
    }
  }
  if (!queueAccount) throw new ConfigError("queueAccount not created yet");

  const oracleAccount = await OracleAccount.create(anchorProgram, {
    queueAccount: oracleQueueAccount,
  });
  writeKeys(fileName, oracleAccount);
  console.log(
    "Created:".padEnd(8, " "),
    toAccountString(fileName, oracleAccount.publicKey)
  );
  return oracleAccount;
};
