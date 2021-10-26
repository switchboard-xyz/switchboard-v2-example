import { OracleQueueAccount } from "@switchboard-xyz/switchboard-v2";
import * as anchor from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import { writeKeys } from "../../utils";
import { loadAnchor } from "../../anchor";
import { getAuthorityKeypair } from "../authority/account";
import { loadOracleQueueAccount } from "./load";

export const getOracleQueue = async (
  program?: anchor.Program,
  authority?: PublicKey
): Promise<OracleQueueAccount> => {
  const anchorProgram = program ? program : await loadAnchor();
  const updateAuthority = authority
    ? authority
    : getAuthorityKeypair().publicKey;

  const queueAccount = loadOracleQueueAccount(anchorProgram);
  if (queueAccount) return queueAccount;
  const oracleQueueAccount = await OracleQueueAccount.create(anchorProgram, {
    name: Buffer.from("q1"),
    metadata: Buffer.from(""),
    slashingEnabled: false,
    reward: new anchor.BN(0),
    minStake: new anchor.BN(0),
    authority: updateAuthority,
  });
  writeKeys("oracle_queue", oracleQueueAccount);

  return oracleQueueAccount;
};
