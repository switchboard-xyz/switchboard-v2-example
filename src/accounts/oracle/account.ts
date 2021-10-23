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
  // try to read file, if not found create
  const fName = "oracle_account";
  const readKey = readPublicKey(fName);
  if (readKey) {
    try {
      const oracleAccount = new OracleAccount({
        program: anchorProgram,
        publicKey: readKey,
      });
      if (oracleAccount?.keypair) {
        writeSecretKey(fName, oracleAccount?.keypair);
      }
      console.log(
        "Local:".padEnd(8, " "),
        toAccountString(fName, oracleAccount.publicKey)
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
  if (oracleAccount?.publicKey) {
    writePublicKey(fName, oracleAccount?.publicKey);
  }
  if (oracleAccount?.keypair) {
    writeSecretKey(fName, oracleAccount?.keypair);
  }
  console.log(
    "Created:".padEnd(8, " "),
    toAccountString(fName, oracleAccount.publicKey)
  );
  return oracleAccount;
};
