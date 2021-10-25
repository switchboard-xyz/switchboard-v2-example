import {
  OracleQueueAccount,
  AggregatorAccount,
  JobAccount,
  LeaseAccount,
  CrankAccount,
  PermissionAccount,
  SwitchboardPermission,
} from "@switchboard-xyz/switchboard-v2";
import { FeedDefinition } from "../../types";
import * as anchor from "@project-serum/anchor";
import { getAuthorityKeypair, getOracleQueue } from "../";
import { loadAggregatorAccount } from "./load";
import { writeKeys } from "../../utils";
import { OracleJob } from "@switchboard-xyz/switchboard-api";
import chalk from "chalk";
import { Keypair, PublicKey } from "@solana/web3.js";
import { loadLeaseContract } from "../lease-contract/account";

export class Aggregator {
  private program: anchor.Program;
  public feed: FeedDefinition;
  public feedName: string;
  public account: AggregatorAccount | null = null;
  public jobAccounts: JobAccount[] = [];
  public queue?: OracleQueueAccount;

  constructor(program: anchor.Program, feed: FeedDefinition) {
    this.program = program;
    this.feed = feed;
    this.feedName = feed.name.toString();
    this.account = loadAggregatorAccount(this.feedName, this.program);
  }

  public async create(queueAccount?: OracleQueueAccount): Promise<void> {
    if (this.account) return; // already loaded from local storage
    const oracleQueueAccount = queueAccount
      ? queueAccount
      : await getOracleQueue();
    this.queue = oracleQueueAccount;

    const aggregatorAccount = await AggregatorAccount.create(this.program, {
      ...this.feed,
      queueAccount: oracleQueueAccount,
    });
    this.account = aggregatorAccount;
    writeKeys("aggregator_account", aggregatorAccount, [
      "feeds",
      this.feedName,
    ]);
    return;
  }

  public async permitQueue(authority?: Keypair): Promise<void> {
    try {
      if (!this.queue) {
        this.queue = await getOracleQueue();
      }
      if (!this.account?.publicKey) {
        throw new Error(`failed to permit account ${this.feedName}`);
      }
      const updateAuthority = authority ? authority : getAuthorityKeypair();
      const permissionAccount = await PermissionAccount.create(this.program, {
        authority: this.program.provider.wallet.publicKey,
        granter: this.queue.publicKey,
        grantee: this.account.publicKey,
      });
      await permissionAccount.set({
        authority: updateAuthority,
        permission: SwitchboardPermission.PERMIT_ORACLE_QUEUE_USAGE,
        enable: true,
      });
      writeKeys("oracle_queue_permission_account", permissionAccount, [
        "feeds",
        this.feedName,
      ]);
    } catch (e) {
      console.error(e);
    }
  }

  public async verifyJobs(): Promise<Error | null> {
    if (!this.account)
      return new Error(`failed to verify account ${this.feedName}`);
    const aggregator = await this.account.loadData();
    const jobs: OracleJob[] = await this.account.loadJobs();
    const jobFoundMap = {};
    for (const jobKeyRawIdx in jobs) {
      const jobKey = aggregator.jobPubkeysData[jobKeyRawIdx];
      const job = jobs[jobKeyRawIdx];
      const jobJson = JSON.stringify(job.tasks);
      let shouldDelete = true;
      for (
        let jobAnnealIdx = 0;
        jobAnnealIdx < this.feed.jobs.length;
        ++jobAnnealIdx
      ) {
        const tasksJson = JSON.stringify(this.feed.jobs[jobAnnealIdx]);
        if (jobJson === tasksJson) {
          jobFoundMap[tasksJson] = true;
          shouldDelete = false;
          break;
        }
      }
      if (shouldDelete) {
        console.log(` ${chalk.red("Deleting Job:")} ${jobJson}`);
        await this.account.removeJob(
          new JobAccount({ program: this.program, publicKey: jobKey })
        );
      }
    }
    for (
      let jobAnnealIdx = 0;
      jobAnnealIdx < this.feed.jobs.length;
      ++jobAnnealIdx
    ) {
      const tasksJson = JSON.stringify(this.feed.jobs[jobAnnealIdx]);
      if (!(tasksJson in jobFoundMap)) {
        const data = Buffer.from(
          OracleJob.encodeDelimited(
            OracleJob.create({
              tasks: this.feed.jobs[jobAnnealIdx],
            })
          ).finish()
        );

        const keypair = anchor.web3.Keypair.generate();
        console.log(` ${chalk.green("Adding Job:")} ${tasksJson}`);

        try {
          const job = await JobAccount.create(this.program, {
            data,
            keypair,
          });
          await this.account.addJob(job);
          writeKeys(`job_account_${jobAnnealIdx}`, job, [
            "feeds",
            this.feedName,
          ]);
        } catch (e) {
          console.log(keypair.publicKey.toBase58());
          throw e;
        }
      }
    }
    return null;
  }
  public async fundLease(
    loadAmount: number,
    funder: PublicKey,
    authority?: Keypair
  ): Promise<LeaseAccount | Error> {
    if (!this.queue) {
      this.queue = await getOracleQueue();
    }
    if (!this.account)
      return new Error(`failed to get account to fund ${this.feedName}`);
    const funderAuthority = authority ? authority : getAuthorityKeypair();

    const lseContract = await loadLeaseContract("feedName", this.program);
    if (lseContract) return lseContract;

    const leaseContract = await LeaseAccount.create(this.program, {
      loadAmount: new anchor.BN(loadAmount),
      funder: funder,
      funderAuthority,
      oracleQueueAccount: this.queue,
      aggregatorAccount: this.account,
    });
    writeKeys("lease_contract", leaseContract, ["feeds", this.feedName]);
    return leaseContract;
  }

  public async addToCrank(crankAccount: CrankAccount): Promise<void> {
    if (!this.account)
      throw new Error(`failed to get account to add to crank ${this.feedName}`);
    await crankAccount.push({ aggregatorAccount: this.account });
  }
}
