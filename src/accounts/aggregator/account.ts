import {
  OracleQueueAccount,
  AggregatorAccount,
} from "@switchboard-xyz/switchboard-v2";
import * as anchor from "@project-serum/anchor";
import {
  writePublicKey,
  readPublicKey,
  writeSecretKey,
  toAccountString,
} from "../../utils";
import { FeedDefinition } from "../../types";
import { loadAnchor } from "../../anchor";
import { getOracleQueue } from "../";
import { ALL_FEEDS } from "./";
import { readSecretKey } from "../../utils/readSecretKey";

/**
 * checks for public key file and if not found creates PDA account of oracle queue
 * @returns oracle account
 */
export const getAggregatorAccount = async (
  feed: FeedDefinition,
  program?: anchor.Program,
  queueAccount?: OracleQueueAccount
): Promise<AggregatorAccount> => {
  const anchorProgram = program ? program : await loadAnchor();
  const oracleQueueAccount = queueAccount
    ? queueAccount
    : await getOracleQueue();
  // try to read file, if not found create
  const fileName = `${feed.name}_aggregator_account`;
  const readKey = readSecretKey(fileName);
  if (readKey) {
    try {
      const aggregatorAccount = new AggregatorAccount({
        program: anchorProgram,
        keypair: readKey,
      });
      if (aggregatorAccount?.keypair) {
        writeSecretKey(fileName, aggregatorAccount?.keypair);
      }
      //   console.log(
      //     "Local:".padEnd(8, " "),
      //     toAccountString(fileName, aggregatorAccount?.publicKey)
      //   );
      return aggregatorAccount;
    } catch (err) {
      console.error(err);
    }
  }
  //   if (!oracleQueueAccount)
  //     throw new ConfigError("queueAccount not created yet");

  const aggregatorAccount = await AggregatorAccount.create(anchorProgram, {
    ...ALL_FEEDS[0],
    queueAccount: oracleQueueAccount,
  });
  if (aggregatorAccount?.publicKey) {
    writePublicKey(fileName, aggregatorAccount?.publicKey);
  }
  if (aggregatorAccount?.keypair) {
    writeSecretKey(fileName, aggregatorAccount?.keypair);
  }
  //   console.log(
  //     "Created:".padEnd(8, " "),
  //     toAccountString(fileName, aggregatorAccount.publicKey)
  //   );
  return aggregatorAccount;
};
