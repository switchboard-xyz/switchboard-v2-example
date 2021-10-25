import {
  OracleQueueAccount,
  AggregatorAccount,
  JobAccount,
} from "@switchboard-xyz/switchboard-v2";
import * as anchor from "@project-serum/anchor";
import { toAccountString, readSecretKey, writeKeys, sleep } from "../../utils";
import { FeedDefinition, ConfigError } from "../../types";
import { loadAnchor } from "../../anchor";
import { getOracleQueue } from "../";
import { OracleJob } from "@switchboard-xyz/switchboard-api";
import chalk from "chalk";

export const loadAggregatorAccount = async (
  feedName: string,
  program?: anchor.Program
): Promise<AggregatorAccount | null> => {
  const anchorProgram = program ? program : await loadAnchor();
  const readKey = readSecretKey("aggregator_account", ["feeds", feedName]);
  if (readKey) {
    try {
      const aggregatorAccount = new AggregatorAccount({
        program: anchorProgram,
        keypair: readKey,
      });
      return aggregatorAccount;
    } catch (err) {
      console.error(err);
    }
  }
  return null;
};

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

  const feedName = feed.name.toString();

  const aggAccount = await loadAggregatorAccount(feedName, anchorProgram);
  if (aggAccount) {
    if (aggAccount.publicKey)
      console.log(
        "Local:".padEnd(8, " "),
        toAccountString(feedName, aggAccount?.publicKey)
      );
    await verifyAggregatorJobs(feed, anchorProgram, aggAccount);
    return aggAccount;
  }

  const aggregatorAccount = await AggregatorAccount.create(anchorProgram, {
    ...feed,
    queueAccount: oracleQueueAccount,
  });
  await sleep(500); // need to give it time to update or else "account doesn't exist"
  // add all jobs

  const jobs: OracleJob[] = await aggregatorAccount.loadJobs();
  console.log(feedName, "jobs:", jobs);
  if (jobs) {
    for await (const [i, j] of feed.jobs.entries()) {
      const data = Buffer.from(
        OracleJob.encodeDelimited(
          OracleJob.create({
            tasks: j,
          })
        ).finish()
      );
      const keypair = anchor.web3.Keypair.generate();
      const job: JobAccount = await JobAccount.create(anchorProgram, {
        data,
        keypair,
      });
      await aggregatorAccount.addJob(job);
      writeKeys(`job_account_${i}`, aggregatorAccount, ["feeds", feedName]);
    }
  }

  writeKeys("aggregator_account", aggregatorAccount, ["feeds", feedName]);
  if (aggregatorAccount.publicKey)
    console.log(
      "Created:".padEnd(8, " "),
      toAccountString(feedName, aggregatorAccount?.publicKey)
    );
  return aggregatorAccount;
};

/**
 * Adds/Deletes necessary jobs from Aggregator based on FeedDefinition
 */
export const verifyAggregatorJobs = async (
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
