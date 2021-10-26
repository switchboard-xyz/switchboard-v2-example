import {
  OracleQueueAccount,
  AggregatorAccount,
  JobAccount,
  LeaseAccount,
  CrankAccount,
  PermissionAccount,
  SwitchboardPermission,
} from "@switchboard-xyz/switchboard-v2";
import {
  AggregatorDefinition,
  JobSchema,
  AggregatorSchema,
  keypair as oKeypair,
} from "../types";
import * as anchor from "@project-serum/anchor";
import { OracleJob } from "@switchboard-xyz/switchboard-api";
import { Keypair, PublicKey } from "@solana/web3.js";
import { getJobTask } from "./jobs";
import chalk from "chalk";
import { toAccountString } from "../utils";

export class Aggregator {
  private program: anchor.Program;
  private authority: Keypair;
  private publisher: PublicKey;
  public queueAccount: OracleQueueAccount;
  public feed: AggregatorDefinition;
  public feedName: string;
  public account?: AggregatorAccount;
  public jobs: JobSchema[] = [];
  public permissionAccount?: PermissionAccount;
  public leaseContract?: LeaseAccount;

  constructor(
    program: anchor.Program,
    authority: Keypair,
    publisher: PublicKey,
    queueAccount: OracleQueueAccount,
    feed: AggregatorDefinition
  ) {
    this.program = program;
    this.authority = authority;
    this.publisher = publisher;
    this.queueAccount = queueAccount;
    this.feed = feed;
    this.feedName = feed.name.toString();
  }

  public async create(): Promise<AggregatorSchema> {
    this.account = await this.createAccount();
    if (!this.account.keypair)
      throw new Error(`failec to get keypair for ${this.feedName}`);
    console.log(
      `   === ${chalk.green(this.feedName)} === ${this.account.publicKey}`
    );
    this.jobs = await this.createJobAccounts(this.account);
    this.permissionAccount = await this.permitToQueue(this.account);
    this.leaseContract = await this.fundLease(this.account, 1000);
    return {
      ...this.feed,
      keypair: new oKeypair(this.account.keypair),
      queuePermissionAccount: this.permissionAccount.publicKey.toString(),
      leaseContract: this.leaseContract.publicKey.toString(),
      jobs: this.jobs,
    };
  }

  private async createAccount(): Promise<AggregatorAccount> {
    const aggregatorAccount = await AggregatorAccount.create(this.program, {
      name: Buffer.from(this.feed.name),
      batchSize: this.feed.batchSize,
      minRequiredOracleResults: this.feed.minRequiredOracleResults,
      minRequiredJobResults: this.feed.minRequiredJobResults,
      minUpdateDelaySeconds: this.feed.minUpdateDelaySeconds,
      queueAccount: this.queueAccount,
    });
    return aggregatorAccount;
  }

  private async createJobAccounts(
    account: AggregatorAccount
  ): Promise<JobSchema[]> {
    const jobs: JobSchema[] = [];
    if (!this.feed.jobs || this.feed.jobs.length === 0) return jobs;
    for await (const job of this.feed.jobs) {
      const tasks = await getJobTask(job);
      const data = Buffer.from(
        OracleJob.encodeDelimited(
          OracleJob.create({
            tasks,
          })
        ).finish()
      );
      const keypair = anchor.web3.Keypair.generate();
      const jobAccount = await JobAccount.create(this.program, {
        data,
        keypair,
      });
      await account.addJob(jobAccount);
      jobs.push({
        ...job,
        keypair: new oKeypair(keypair),
      });
      console.log(
        toAccountString(`${job.source}-job-account`, jobAccount.publicKey)
      );
    }
    return jobs;
  }

  private async permitToQueue(
    account: AggregatorAccount
  ): Promise<PermissionAccount> {
    if (!account.publicKey)
      throw new Error(
        `failed to read public key for ${this.feedName} - ${this.account}`
      );
    const permissionAccount = await PermissionAccount.create(this.program, {
      authority: this.program.provider.wallet.publicKey,
      granter: this.queueAccount.publicKey,
      grantee: account.publicKey,
    });
    await permissionAccount.set({
      authority: this.authority,
      permission: SwitchboardPermission.PERMIT_ORACLE_QUEUE_USAGE,
      enable: true,
    });
    return permissionAccount;
  }

  private async fundLease(
    account: AggregatorAccount,
    loadAmount: number
  ): Promise<LeaseAccount> {
    const leaseContract = await LeaseAccount.create(this.program, {
      loadAmount: new anchor.BN(loadAmount),
      funder: this.publisher,
      funderAuthority: this.authority,
      oracleQueueAccount: this.queueAccount,
      aggregatorAccount: account,
    });
    return leaseContract;
  }

  public async addToCrank(crankAccount: CrankAccount): Promise<void> {
    if (!this.account?.publicKey)
      throw new Error(`failed to get account to add to crank ${this.feedName}`);
    const allCrankpqData: { pubkey: PublicKey; nextTimestamp: anchor.BN }[] = (
      await crankAccount.loadData()
    ).pqData;
    const allCrankAccounts: PublicKey[] = allCrankpqData.map(
      (crank: { pubkey: PublicKey; nextTimestamp: anchor.BN }) => crank.pubkey
    );
    if (allCrankAccounts.indexOf(this.account.publicKey)) {
      console.log(
        `${this.feedName} already added to crank ${crankAccount.publicKey}`
      );
    } else {
      await crankAccount.push({ aggregatorAccount: this.account });
      console.log(`${this.feedName} added to crank ${crankAccount.publicKey}`);
    }
  }
}
