import {
  OracleAccount,
  OracleQueueAccount,
} from "@switchboard-xyz/switchboard-v2";
import * as anchor from "@project-serum/anchor";
import { writeKeys } from "../../utils";
import { ConfigError } from "../../types";
import { loadAnchor } from "../../anchor";
import { getOracleQueue } from "../";
import { loadOracleAccount } from "./load";

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

  if (!queueAccount) throw new ConfigError("queueAccount not created yet");

  const fileName = "oracle_account";
  const orcleAccount = loadOracleAccount(fileName, anchorProgram);
  if (orcleAccount) return orcleAccount;

  const oracleAccount = await OracleAccount.create(anchorProgram, {
    queueAccount: oracleQueueAccount,
  });
  writeKeys(fileName, oracleAccount);
  return oracleAccount;
};
