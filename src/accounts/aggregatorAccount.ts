import * as anchor from "@project-serum/anchor";
import { PublicKey, Keypair } from "@solana/web3.js";
import {
  AggregatorAccount,
  LeaseAccount,
  OracleQueueAccount,
  PermissionAccount,
  SwitchboardPermission,
} from "@switchboard-xyz/switchboard-v2";
import { jsonObject, jsonMember, jsonArrayMember, toJson } from "typedjson";
import { toAccountString } from "../utils";
import { JobDefinition, JobSchema } from "./";
import { AnchorProgram } from "../program";

@jsonObject
export class AggregatorDefinition {
  @jsonMember
  public name!: string;
  @jsonMember
  public batchSize!: number;
  @jsonMember
  public minRequiredOracleResults!: number;
  @jsonMember
  public minRequiredJobResults!: number;
  @jsonMember
  public minUpdateDelaySeconds!: number;
  @jsonArrayMember(String)
  public cranks!: string[];
  @jsonArrayMember(JobDefinition)
  public jobs!: JobDefinition[];
  program: anchor.Program = AnchorProgram.getInstance().program;
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
      publicKey: aggregatorAccount.keypair.publicKey,
      queuePermissionAccount: permissionAccount.publicKey,
      leaseContract: leaseContract.publicKey,
      jobs: jobs,
    };
  }

  private async createAccount(
    oracleQueueAccount: OracleQueueAccount
  ): Promise<AggregatorAccount> {
    const aggregatorAccount = await AggregatorAccount.create(this.program, {
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
    const permissionAccount = await PermissionAccount.create(this.program, {
      authority: this.program.provider.wallet.publicKey,
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
    const leaseContract = await LeaseAccount.create(this.program, {
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

@toJson({ overwrite: true })
@jsonObject
export class AggregatorSchema extends AggregatorDefinition {
  @jsonMember
  public secretKey!: Uint8Array;
  @jsonMember
  public publicKey!: PublicKey;
  @jsonMember
  queuePermissionAccount!: PublicKey;
  @jsonMember
  leaseContract!: PublicKey;
  @jsonArrayMember(JobSchema)
  jobs!: JobSchema[];
}

export {};
