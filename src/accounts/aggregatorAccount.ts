import * as anchor from "@project-serum/anchor";
import { PublicKey, Keypair } from "@solana/web3.js";
import {
  AggregatorAccount,
  LeaseAccount,
  OracleQueueAccount,
  PermissionAccount,
  SwitchboardPermission,
} from "@switchboard-xyz/switchboard-v2";
import {
  Expose,
  Type,
  Exclude,
  plainToClass,
  Transform,
} from "class-transformer";
import { toAccountString } from "../utils";
import { JobDefinition, JobSchema } from "./";
import { AnchorProgram } from "../program";
import TransformPublicKey from "../types/transformPublicKey";
import TransformSecretKey from "../types/transformSecretKey";
export interface IAggregatorDefinition {
  name: string;
  batchSize: number;
  minRequiredOracleResults: number;
  minRequiredJobResults: number;
  minUpdateDelaySeconds: number;
  cranks: string[];
  jobs: JobDefinition[];
}
export interface IAggregatorSchema extends IAggregatorDefinition {
  secretKey: Uint8Array;
  publicKey: PublicKey;
  queuePermissionAccount: PublicKey;
  leaseContract: PublicKey;
  jobs: JobSchema[];
}
export class AggregatorDefinition {
  @Exclude()
  _program: anchor.Program = AnchorProgram.getInstance().program;
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
  @Type(() => String)
  public cranks!: string[];
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
    authority: Keypair,
    publisher: PublicKey
  ): Promise<AggregatorSchema> {
    const aggregatorAccount = await this.createAccount(oracleQueueAccount);
    if (!aggregatorAccount.keypair)
      throw new Error(`failed to get keypair for ${this.name}`);

    const jobs = await this.createJobAccounts(aggregatorAccount);
    const permissionAccount = await this.permitToQueue(
      oracleQueueAccount,
      aggregatorAccount,
      authority
    );
    const leaseContract = await this.fundLease(
      oracleQueueAccount,
      aggregatorAccount,
      authority,
      publisher,
      1000
    );

    return {
      ...this,
      secretKey: aggregatorAccount.keypair.secretKey,
      publicKey: aggregatorAccount.keypair.publicKey.toString(),
      queuePermissionAccount: permissionAccount.publicKey.toString(),
      leaseContract: leaseContract.publicKey.toString(),
      jobs: jobs,
    };
  }

  private async createAccount(
    oracleQueueAccount: OracleQueueAccount
  ): Promise<AggregatorAccount> {
    const aggregatorAccount = await AggregatorAccount.create(this._program, {
      name: Buffer.from(this.name),
      batchSize: this.batchSize,
      minRequiredOracleResults: this.minRequiredOracleResults,
      minRequiredJobResults: this.minRequiredJobResults,
      minUpdateDelaySeconds: this.minUpdateDelaySeconds,
      queueAccount: oracleQueueAccount,
    });
    console.log(toAccountString(`${this.name}-aggregator`, aggregatorAccount));
    return aggregatorAccount;
  }

  private async createJobAccounts(
    aggregatorAccount: AggregatorAccount
  ): Promise<JobSchema[]> {
    const jobs: JobSchema[] = [];
    if (!this.jobs || this.jobs.length === 0) return jobs;
    for await (const job of this.jobs) {
      jobs.push(await job.toSchema(aggregatorAccount));
    }
    return jobs;
  }

  private async permitToQueue(
    oracleQueueAccount: OracleQueueAccount,
    aggregatorAccount: AggregatorAccount,
    authority: Keypair
  ): Promise<PermissionAccount> {
    if (!aggregatorAccount.publicKey)
      throw new Error(
        `failed to read public key for ${this.name} - ${aggregatorAccount.publicKey}`
      );
    const permissionAccount = await PermissionAccount.create(this._program, {
      authority: this._program.provider.wallet.publicKey,
      granter: oracleQueueAccount.publicKey,
      grantee: aggregatorAccount.publicKey,
    });
    await permissionAccount.set({
      authority: authority,
      permission: SwitchboardPermission.PERMIT_ORACLE_QUEUE_USAGE,
      enable: true,
    });
    console.log(toAccountString(`${this.name}-permission`, permissionAccount));
    return permissionAccount;
  }

  private async fundLease(
    oracleQueueAccount: OracleQueueAccount,
    aggregatorAccount: AggregatorAccount,
    authority: Keypair,
    publisher: PublicKey,
    loadAmount: number
  ): Promise<LeaseAccount> {
    const leaseContract = await LeaseAccount.create(this._program, {
      loadAmount: new anchor.BN(loadAmount),
      funder: publisher,
      funderAuthority: authority,
      oracleQueueAccount: oracleQueueAccount,
      aggregatorAccount,
    });
    console.log(toAccountString(`${this.name}-lease`, leaseContract));
    return leaseContract;
  }
}

export class AggregatorSchema extends AggregatorDefinition {
  @Expose()
  @Type(() => Uint8Array)
  @TransformSecretKey()
  public secretKey!: Uint8Array;
  @Expose()
  public publicKey!: string;
  @Expose()
  public queuePermissionAccount!: string;
  @Expose()
  public leaseContract!: string;
  @Expose()
  @Type(() => JobSchema)
  public jobs!: JobSchema[];

  // private toAccount(): AggregatorAccount {
  //   // const keypair = getKeypair(aggregator.keypair);
  //   const keypair = Keypair.fromSecretKey(this.secretKey);
  //   const aggregatorAccount = new AggregatorAccount({
  //     program: this._program,
  //     keypair,
  //   });
  //   return aggregatorAccount;
  // }
}

export {};
