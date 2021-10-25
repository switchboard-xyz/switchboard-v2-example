import {
  OracleQueueAccount,
  AggregatorAccount,
  AggregatorInitParams,
} from "@switchboard-xyz/switchboard-v2";
import * as anchor from "@project-serum/anchor";
import { toAccountString, readSecretKey, writeKeys } from "../../utils";
import { FeedDefinition, ConfigError } from "../../types";
import { loadAnchor } from "../../anchor";
import { getOracleQueue } from "../";

export const getAggregatorAccount = async (
  feed: FeedDefinition,
  program?: anchor.Program,
  queueAccount?: OracleQueueAccount
): Promise<AggregatorAccount> => {
  const anchorProgram = program ? program : await loadAnchor();
  const oracleQueueAccount = queueAccount
    ? queueAccount
    : await getOracleQueue();

  if (!oracleQueueAccount)
    throw new ConfigError("queueAccount not created yet");

  const fileName = `${feed.name.toString()}_aggregator_account`;
  const readKey = readSecretKey(fileName);
  if (readKey) {
    try {
      const aggregatorAccount = new AggregatorAccount({
        program: anchorProgram,
        keypair: readKey,
      });
      if (aggregatorAccount.publicKey)
        console.log(
          "Local:".padEnd(8, " "),
          toAccountString(fileName, aggregatorAccount?.publicKey)
        );
      return aggregatorAccount;
    } catch (err) {
      console.error(err);
    }
  }

  const initParams: AggregatorInitParams = {
    // name: feed.name,
    // batchSize: feed.batchSize,
    // minRequiredOracleResults: feed.minRequiredOracleResults,
    // minRequiredJobResults: feed.minRequiredJobResults,
    // minUpdateDelaySeconds: feed.minUpdateDelaySeconds,
    ...feed,
    queueAccount: oracleQueueAccount,
  };
  const aggregatorAccount = await AggregatorAccount.create(
    anchorProgram,
    initParams
  );
  console.log("created ", feed.name.toString());
  // now add jobs
  writeKeys(fileName, aggregatorAccount);
  if (aggregatorAccount.publicKey)
    console.log(
      "Created:".padEnd(8, " "),
      toAccountString(fileName, aggregatorAccount?.publicKey)
    );
  return aggregatorAccount;
};
