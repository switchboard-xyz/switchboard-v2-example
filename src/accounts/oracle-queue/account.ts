import * as sbv2 from "@switchboard-xyz/switchboard-v2";
import * as anchor from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import { writeSecretKey, readSecretKey, toAccountString } from "../../utils";
import { OracleQueueAccount } from "@switchboard-xyz/switchboard-v2";

export const getOracleQueue = async (
  program: anchor.Program,
  authority: PublicKey
): Promise<sbv2.OracleQueueAccount> => {
  const fName = "oracle_queue";
  const readKey = readSecretKey(fName);
  if (readKey) {
    try {
      const oracleQueueAccount = new OracleQueueAccount({
        program,
        keypair: readKey,
      });
      console.log(
        "Local:".padEnd(8, " "),
        toAccountString(fName, oracleQueueAccount.publicKey)
      );
      return oracleQueueAccount;
    } catch (err) {
      console.error("error loading account", fName, err);
    }
  }
  const oracleQueueAccount = await sbv2.OracleQueueAccount.create(program, {
    name: Buffer.from("q1"),
    metadata: Buffer.from(""),
    slashingEnabled: false,
    reward: new anchor.BN(0),
    minStake: new anchor.BN(0),
    authority: authority,
  });
  if (oracleQueueAccount?.keypair) {
    writeSecretKey(fName, oracleQueueAccount?.keypair);
  }
  console.log(
    "Created:".padEnd(8, " "),
    toAccountString(fName, oracleQueueAccount.publicKey)
  );
  return oracleQueueAccount;
};
