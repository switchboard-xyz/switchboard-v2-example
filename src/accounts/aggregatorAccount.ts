import * as anchor from "@project-serum/anchor";
import { Keypair, PublicKey } from "@solana/web3.js";
import {
  AggregatorAccount,
  LeaseAccount,
  OracleQueueAccount,
  PermissionAccount,
  SwitchboardPermission,
} from "@switchboard-xyz/switchboard-v2";
import { Exclude, Expose, plainToClass, Type } from "class-transformer";
import { AnchorProgram, unwrapSecretKey } from "../types";
import { toAccountString } from "../utils";
import { IJobDefinition, JobDefinition, JobSchema } from "./";

export interface IAggregatorDefinition {
  name: string;
  batchSize: number;
  minRequiredOracleResults: number;
  minRequiredJobResults: number;
  minUpdateDelaySeconds: number;
  jobs: IJobDefinition[];
}
export class AggregatorDefinition {
  @Exclude()
  _program: Promise<anchor.Program> = AnchorProgram.getInstance().program;

  @Exclude()
  _authority: Keypair = AnchorProgram.getInstance().authority;

  @Expose()
  public name!: string;

  @Expose()
  public batchSize!: number;

  @Expose()
  public minRequiredOracleResults!: number;

  @Expose()
  public minRequiredJobResults!: number;

  @Expose()
  public minUpdateDelaySeconds!: number;

  @Expose()
  @Type(() => JobDefinition)
  public jobs!: JobDefinition[];

  /**
   * Creates the neccesary accounts to add a feed to a queue and fund updates
   * 1. Create Aggregator account and assign it to an oracle queue
   * 2. Create Job account with job definitions
   * 3. Create Permission account for Aggregator to join an Oracle Queue
   * 4. Fund the Lease account for oracles to process any updates
   */
  public async toSchema(
    oracleQueueAccount: OracleQueueAccount,
    publisher: PublicKey,
    usdtAggregator?: PublicKey
  ): Promise<AggregatorSchema> {
    const aggregatorAccount = await this.createAccount(oracleQueueAccount);
    if (!aggregatorAccount.keypair)
      throw new Error(`failed to get keypair for ${this.name}`);

    const jobs = await this.createJobAccounts(
      aggregatorAccount,
      usdtAggregator
    );
    const permissionAccount = await this.permitToQueue(
      oracleQueueAccount,
      aggregatorAccount
    );
    const leaseContract = await this.fundLease(
      oracleQueueAccount,
      aggregatorAccount,
      publisher,
      1000
    );

    return plainToClass(AggregatorSchema, {
      ...this,
      secretKey: `[${aggregatorAccount.keypair.secretKey}]`,
      publicKey: aggregatorAccount.keypair.publicKey.toString(),
      queuePermissionAccount: permissionAccount.publicKey.toString(),
      leaseContract: leaseContract.publicKey.toString(),
      jobs: jobs,
    });
  }

  private async createAccount(
    oracleQueueAccount: OracleQueueAccount
  ): Promise<AggregatorAccount> {
    const aggregatorAccount = await AggregatorAccount.create(
      await this._program,
      {
        name: Buffer.from(this.name),
        batchSize: this.batchSize,
        minRequiredOracleResults: this.minRequiredOracleResults,
        minRequiredJobResults: this.minRequiredJobResults,
        minUpdateDelaySeconds: this.minUpdateDelaySeconds,
        queueAccount: oracleQueueAccount,
      }
    );
    console.log(toAccountString(`${this.name}-aggregator`, aggregatorAccount));
    return aggregatorAccount;
  }

  private async createJobAccounts(
    aggregatorAccount: AggregatorAccount,
    usdtAggregator?: PublicKey
  ): Promise<JobSchema[]> {
    const jobs: JobSchema[] = [];
    if (!this.jobs || this.jobs.length === 0) return jobs;
    for await (const job of this.jobs) {
      jobs.push(await job.toSchema(aggregatorAccount, usdtAggregator));
    }
    return jobs;
  }

  private async permitToQueue(
    oracleQueueAccount: OracleQueueAccount,
    aggregatorAccount: AggregatorAccount
  ): Promise<PermissionAccount> {
    if (!aggregatorAccount.publicKey)
      throw new Error(
        `failed to read public key for ${this.name} - ${aggregatorAccount.publicKey}`
      );
    const permissionAccount = await PermissionAccount.create(
      await this._program,
      {
        authority: this._authority.publicKey,
        granter: oracleQueueAccount.publicKey,
        grantee: aggregatorAccount.publicKey,
      }
    );
    await permissionAccount.set({
      authority: this._authority,
      permission: SwitchboardPermission.PERMIT_ORACLE_QUEUE_USAGE,
      enable: true,
    });
    console.log(
      toAccountString(`     ${this.name}-permission`, permissionAccount)
    );
    return permissionAccount;
  }

  private async fundLease(
    oracleQueueAccount: OracleQueueAccount,
    aggregatorAccount: AggregatorAccount,
    publisher: PublicKey,
    loadAmount: number
  ): Promise<LeaseAccount> {
    const leaseContract = await LeaseAccount.create(await this._program, {
      loadAmount: new anchor.BN(loadAmount),
      funder: publisher,
      funderAuthority: this._authority,
      oracleQueueAccount: oracleQueueAccount,
      aggregatorAccount,
    });
    console.log(toAccountString(`     ${this.name}-lease`, leaseContract));
    return leaseContract;
  }
}

export class AggregatorSchema extends AggregatorDefinition {
  @Expose()
  public secretKey!: string;

  @Expose()
  public publicKey!: string;

  @Expose()
  public queuePermissionAccount!: string;

  @Expose()
  public leaseContract!: string;

  @Expose()
  public crank?: string;

  @Expose()
  @Type(() => JobSchema)
  public jobs!: JobSchema[];

  public async toAccount(): Promise<AggregatorAccount> {
    // const keypair = getKeypair(aggregator.keypair);
    const keypair = Keypair.fromSecretKey(unwrapSecretKey(this.secretKey));
    const aggregatorAccount = new AggregatorAccount({
      program: await this._program,
      keypair,
    });
    return aggregatorAccount;
  }

  public async getPermissionAccount(): Promise<PermissionAccount> {
    const publicKey = new PublicKey(this.queuePermissionAccount);
    if (!publicKey)
      throw new Error(
        `failed to load Aggregator permission account ${this.queuePermissionAccount}`
      );
    const permissionAccount = new PermissionAccount({
      program: await this._program,
      publicKey,
    });
    return permissionAccount;
  }
}

export {};
