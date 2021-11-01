import * as anchor from "@project-serum/anchor";
import { Keypair, PublicKey } from "@solana/web3.js";
import {
  CrankAccount,
  OracleQueueAccount,
} from "@switchboard-xyz/switchboard-v2";
import chalk from "chalk";
import { Exclude, Expose, plainToClass } from "class-transformer";
import { AggregatorSchema } from ".";
import { AnchorProgram } from "../types";
import { toAccountString, unwrapSecretKey } from "../utils";

export interface PqData {
  pubkey: PublicKey;
  nextTimestamp: anchor.BN;
}

export interface ICrankDefinition {
  name: string;
  maxRows: number;
}

export interface ICrankSchema extends ICrankDefinition {
  secretKey: string;
  publicKey: string;
}

export class CrankDefinition implements ICrankDefinition {
  @Exclude()
  _program: Promise<anchor.Program> = AnchorProgram.getInstance().program;

  @Exclude()
  _authority: Keypair = AnchorProgram.getInstance().authority;

  @Expose()
  public name!: string;

  @Expose()
  public maxRows!: number;

  public async toSchema(
    oracleQueueAccount: OracleQueueAccount
  ): Promise<CrankSchema> {
    const crankAccount = await CrankAccount.create(await this._program, {
      name: Buffer.from(this.name),
      queueAccount: oracleQueueAccount,
      maxRows: this.maxRows,
    });
    if (!crankAccount.keypair) throw new Error(`${this.name} missing keypair`);
    console.log(toAccountString(`${this.name}`, crankAccount));

    const crankSchema: ICrankSchema = {
      ...this,
      secretKey: `[${crankAccount.keypair.secretKey}]`,
      publicKey: crankAccount.keypair.publicKey.toString(),
    };
    return plainToClass(CrankSchema, crankSchema);
  }
}

export class CrankSchema extends CrankDefinition implements ICrankSchema {
  @Expose()
  public secretKey!: string;

  @Expose()
  public publicKey!: string;

  public async toAccount(): Promise<CrankAccount> {
    // const keypair = getKeypair(aggregator.keypair);
    const keypair = Keypair.fromSecretKey(unwrapSecretKey(this.secretKey));
    const aggregatorAccount = new CrankAccount({
      program: await this._program,
      keypair,
    });
    return aggregatorAccount;
  }

  public async addFeed(
    aggregator: AggregatorSchema
  ): Promise<string | undefined> {
    const aggregatorAccount = await aggregator.toAccount();
    try {
      (await this.toAccount()).push({
        aggregatorAccount,
      });
      console.log(`${aggregator.name} added to crank ${this.name}`);
      return this.name;
    } catch {
      console.log(`${chalk.red(aggregator.name, "not added to", this.name)}`);
    }
  }

  public async readFeeds(): Promise<PqData[]> {
    const zeroKey = new PublicKey("11111111111111111111111111111111");
    const feeds: PqData[] = (
      await (await this.toAccount()).loadData()
    ).pqData.filter((f: PqData) => !f.pubkey.equals(zeroKey));
    return feeds;
  }
}
export {};
