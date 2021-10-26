import {
  CrankAccount,
  OracleQueueAccount,
} from "@switchboard-xyz/switchboard-v2";
import * as anchor from "@project-serum/anchor";
import { loadCrankAccount } from "./load";
import { writeKeys } from "../../utils";
import { loadAnchor } from "../../anchor";

export const getCrankAccount = async (
  program: anchor.Program,
  oracleQueueAccount: OracleQueueAccount
): Promise<CrankAccount> => {
  const anchorProgram = program ? program : await loadAnchor();

  const fileName = "crank_account";
  const crnkContract = loadCrankAccount(fileName, anchorProgram);
  if (crnkContract) return crnkContract;

  const crankAccount = await CrankAccount.create(anchorProgram, {
    name: Buffer.from("crank1"),
    metadata: Buffer.from(""),
    queueAccount: oracleQueueAccount,
    maxRows: 100,
  });
  writeKeys(fileName, crankAccount);
  return crankAccount;
};
