import {
  OracleQueueAccount,
  AggregatorAccount,
  JobAccount,
  LeaseAccount,
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
import { toAccountString } from "../utils";
import { JobDefinition } from "../types";
import {
  buildBinanceComTask,
  buildBinanceUsTask,
  buildBitfinexTask,
  buildBitstampTask,
  buildBittrexTask,
  buildCoinbaseTask,
  buildFtxUsTask,
  buildFtxComTask,
  buildHuobiTask,
  buildKrakenTask,
  buildKucoinTask,
  buildMxcTask,
  buildOkexTask,
  buildOrcaApiTask,
} from "../dataDefinitions/jobs";

export class Aggregator {
  private program: anchor.Program;
  private authority: Keypair;
  private publisher: PublicKey;
  public oracleQueueAccount: OracleQueueAccount;
  public feed: AggregatorDefinition;
  public feedName: string;

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
    this.oracleQueueAccount = queueAccount;
    this.feed = feed;
    this.feedName = feed.name.toString();
  }

  /**
   * Creates the neccesary accounts to add a feed to a queue and fund updates
   * 1. Create Aggregator account and assign it to an oracle queue
   * 2. Create Job account with job definitions
   * 3. Create Permission account for Aggregator to join an Oracle Queue
   * 4. Fund the Lease account for oracles to process any updates
   */
  public async createSchema(): Promise<AggregatorSchema> {
    const aggregatorAccount = await this.createAccount();
    if (!aggregatorAccount.keypair)
      throw new Error(`failec to get keypair for ${this.feedName}`);

    const jobs = await this.createJobAccounts(aggregatorAccount);
    const permissionAccount = await this.permitToQueue(aggregatorAccount);
    const leaseContract = await this.fundLease(aggregatorAccount, 1000);
    return {
      ...this.feed,
      keypair: new oKeypair(aggregatorAccount.keypair),
      queuePermissionAccount: permissionAccount.publicKey.toString(),
      leaseContract: leaseContract.publicKey.toString(),
      jobs: jobs,
    };
  }

  private async createAccount(): Promise<AggregatorAccount> {
    const aggregatorAccount = await AggregatorAccount.create(this.program, {
      name: Buffer.from(this.feed.name),
      batchSize: this.feed.batchSize,
      minRequiredOracleResults: this.feed.minRequiredOracleResults,
      minRequiredJobResults: this.feed.minRequiredJobResults,
      minUpdateDelaySeconds: this.feed.minUpdateDelaySeconds,
      queueAccount: this.oracleQueueAccount,
    });
    console.log(
      toAccountString(`${this.feedName}-aggregator`, aggregatorAccount)
    );
    return aggregatorAccount;
  }

  private async createJobAccounts(
    aggregatorAccount: AggregatorAccount,
    silent = true
  ): Promise<JobSchema[]> {
    const jobs: JobSchema[] = [];
    if (!this.feed.jobs || this.feed.jobs.length === 0) return jobs;
    for await (const job of this.feed.jobs) {
      const tasks = await mapJobTask(job);
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
      await aggregatorAccount.addJob(jobAccount);
      jobs.push({
        ...job,
        keypair: new oKeypair(keypair),
      });
      if (!silent)
        console.log(toAccountString(`${job.source}-job-account`, jobAccount));
    }
    return jobs;
  }

  private async permitToQueue(
    aggregatorAccount: AggregatorAccount
  ): Promise<PermissionAccount> {
    if (!aggregatorAccount.publicKey)
      throw new Error(
        `failed to read public key for ${this.feedName} - ${aggregatorAccount.publicKey}`
      );
    const permissionAccount = await PermissionAccount.create(this.program, {
      authority: this.program.provider.wallet.publicKey,
      granter: this.oracleQueueAccount.publicKey,
      grantee: aggregatorAccount.publicKey,
    });
    await permissionAccount.set({
      authority: this.authority,
      permission: SwitchboardPermission.PERMIT_ORACLE_QUEUE_USAGE,
      enable: true,
    });
    console.log(
      toAccountString(`${this.feedName}-permission`, permissionAccount)
    );
    return permissionAccount;
  }

  private async fundLease(
    aggregatorAccount: AggregatorAccount,
    loadAmount: number
  ): Promise<LeaseAccount> {
    const leaseContract = await LeaseAccount.create(this.program, {
      loadAmount: new anchor.BN(loadAmount),
      funder: this.publisher,
      funderAuthority: this.authority,
      oracleQueueAccount: this.oracleQueueAccount,
      aggregatorAccount,
    });
    console.log(toAccountString(`${this.feedName}-lease`, leaseContract));
    return leaseContract;
  }
}
export async function mapJobTask(
  job: JobDefinition
): Promise<OracleJob.Task[]> {
  switch (job.source) {
    case "binanceCom":
      return await buildBinanceComTask(job.id);
    case "binanceUs":
      return await buildBinanceUsTask(job.id);
    case "bitfinex":
      return await buildBitfinexTask(job.id);
    case "bitstamp":
      return await buildBitstampTask(job.id);
    case "bittrex":
      return await buildBittrexTask(job.id);
    case "coinbase":
      return await buildCoinbaseTask(job.id);
    case "ftxUs":
      return await buildFtxUsTask(job.id);
    case "ftxCom":
      return await buildFtxComTask(job.id);
    case "huobi":
      return await buildHuobiTask(job.id);
    case "kraken":
      return await buildKrakenTask(job.id);
    case "kucoin":
      return await buildKucoinTask(job.id);
    case "mxc":
      return await buildMxcTask(job.id);
    case "okex":
      return await buildOkexTask(job.id);
    case "orca":
      return await buildOrcaApiTask(job.id);
  }
  return [] as OracleJob.Task[];
}
