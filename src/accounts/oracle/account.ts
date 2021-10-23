import {
  OracleAccount,
  OracleQueueAccount,
} from "@switchboard-xyz/switchboard-v2";
import * as anchor from "@project-serum/anchor";
import { writePublicKey } from "../../utils/writePublicKey";
import { readPublicKey } from "../../utils/readPublicKey";
import { writeSecretKey } from "../../utils/writeSecretKey";
import { ConfigError } from "../../types";
import { toAccountString } from "../../utils/toAccountString";

/**
 * checks for public key file and if not found creates PDA account of oracle queue
 * @returns oracle account
 */
export const getOracleAccount = async (
  program: anchor.Program,
  queueAccount?: OracleQueueAccount
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

  const oracleAccount = await OracleAccount.create(program, {
    queueAccount,
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
