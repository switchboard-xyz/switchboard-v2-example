import { OracleQueueAccount } from "@switchboard-xyz/switchboard-v2";
import * as anchor from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import {
  writeKeys,
  writeSecretKey,
  readSecretKey,
  toAccountString,
} from "../../utils";
import { loadAnchor } from "../../anchor";
import { getAuthorityKeypair } from "../authority/account";

export const getOracleQueue = async (
  program?: anchor.Program,
  authority?: PublicKey
): Promise<OracleQueueAccount> => {
  const anchorProgram = program ? program : await loadAnchor();
  const updateAuthority = authority
    ? authority
    : getAuthorityKeypair().publicKey;

  const fileName = "oracle_queue";
  const readKey = readSecretKey(fileName);
  if (readKey) {
    try {
      const oracleQueueAccount = new OracleQueueAccount({
        program: anchorProgram,
        keypair: readKey,
      });
      console.log(
        "Local:".padEnd(8, " "),
        toAccountString(fileName, oracleQueueAccount.publicKey)
      );
      return oracleQueueAccount;
    } catch (err) {
      console.error("error loading account", fileName, err);
    }
  }
  const oracleQueueAccount = await OracleQueueAccount.create(anchorProgram, {
    name: Buffer.from("q1"),
    metadata: Buffer.from(""),
    slashingEnabled: false,
    reward: new anchor.BN(0),
    minStake: new anchor.BN(0),
    authority: updateAuthority,
  });
  writeSecretKey(fileName, oracleQueueAccount.keypair);

  console.log(
    "Created:".padEnd(8, " "),
    toAccountString(fileName, oracleQueueAccount.publicKey)
  );
  return oracleQueueAccount;
};
