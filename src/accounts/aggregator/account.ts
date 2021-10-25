import {
  OracleQueueAccount,
  AggregatorAccount,
  AggregatorInitParams,
  JobAccount,
} from "@switchboard-xyz/switchboard-v2";
import * as anchor from "@project-serum/anchor";
import { toAccountString, readSecretKey, writeKeys } from "../../utils";
import { FeedDefinition, ConfigError } from "../../types";
import { loadAnchor } from "../../anchor";
import { getOracleQueue } from "../";
import { OracleJob } from "@switchboard-xyz/switchboard-api";
import readline from "readline-sync";
import chalk from "chalk";

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

  const fileName = `${feed.name.toString()}`;
  const readKey = readSecretKey(fileName, "feeds");
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
      await parseAggregatorJobs(feed, anchorProgram, aggregatorAccount);
      return aggregatorAccount;
    } catch (err) {
      console.error(err);
    }
  }

  const aggregatorAccount = await AggregatorAccount.create(anchorProgram, {
    ...feed,
    queueAccount: oracleQueueAccount,
  });
  // add all jobs
  const jobs: OracleJob[] = await aggregatorAccount.loadJobs();
  console.log(jobs);
  if (!jobs) {
    for await (const j of feed.jobs) {
      const data = Buffer.from(
        OracleJob.encodeDelimited(
          OracleJob.create({
            tasks: j,
          })
        ).finish()
      );
      const keypair = anchor.web3.Keypair.generate();
      await aggregatorAccount.addJob(
        await JobAccount.create(anchorProgram, { data, keypair })
      );
    }
  }

  writeKeys(fileName, aggregatorAccount, "feeds");
  if (aggregatorAccount.publicKey)
    console.log(
      "Created:".padEnd(8, " "),
      toAccountString(fileName, aggregatorAccount?.publicKey)
    );
  return aggregatorAccount;
};

/**
 * Adds/Deletes necessary jobs from Aggregator based on FeedDefinition
 */
export const parseAggregatorJobs = async (
  feed: FeedDefinition,
  program: anchor.Program,
  aggregatorAccount: AggregatorAccount
): Promise<void> => {
  const aggregator = await aggregatorAccount.loadData();
  const jobs: OracleJob[] = await aggregatorAccount.loadJobs();
  const jobFoundMap = {};
  for (const jobKeyRawIdx in jobs) {
    const jobKey = aggregator.jobPubkeysData[jobKeyRawIdx];
    const job = jobs[jobKeyRawIdx];
    const jobJson = JSON.stringify(job.tasks);
    let shouldDelete = true;
    for (
      let jobAnnealIdx = 0;
      jobAnnealIdx < feed.jobs.length;
      ++jobAnnealIdx
    ) {
      const tasksJson = JSON.stringify(feed.jobs[jobAnnealIdx]);
      if (jobJson === tasksJson) {
        jobFoundMap[tasksJson] = true;
        shouldDelete = false;
        break;
      }
    }
    if (shouldDelete) {
      console.log(` ${chalk.red("Deleting Job:")} ${jobJson}`);
      await aggregatorAccount.removeJob(
        new JobAccount({ program, publicKey: jobKey })
      );
    }
  }
  for (let jobAnnealIdx = 0; jobAnnealIdx < feed.jobs.length; ++jobAnnealIdx) {
    const tasksJson = JSON.stringify(feed.jobs[jobAnnealIdx]);
    if (!(tasksJson in jobFoundMap)) {
      const data = Buffer.from(
        OracleJob.encodeDelimited(
          OracleJob.create({
            tasks: feed.jobs[jobAnnealIdx],
          })
        ).finish()
      );

      const keypair = anchor.web3.Keypair.generate();
      console.log(` ${chalk.green("Adding Job:")} ${tasksJson}`);
      try {
        await aggregatorAccount.addJob(
          await JobAccount.create(program, { data, keypair })
        );
      } catch (e) {
        console.log(keypair.publicKey.toBase58());
        // console.log(`[${keypair.secretKey}]`);
        throw e;
      }
    }
  }
  return;
};
