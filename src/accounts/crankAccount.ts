import * as anchor from "@project-serum/anchor";
import { Keypair } from "@solana/web3.js";
import {
  CrankAccount,
  OracleQueueAccount,
} from "@switchboard-xyz/switchboard-v2";
import chalk from "chalk";
import { Exclude, Expose, plainToClass } from "class-transformer";
import { AggregatorSchema } from ".";
import { AnchorProgram, unwrapSecretKey } from "../types";
import { toAccountString } from "../utils";

export class CrankDefinition {
  @Exclude()
  _program: anchor.Program = AnchorProgram.getInstance().program;

  @Expose()
  public name!: string;

  @Expose()
  public maxRows!: number;

  public async toSchema(
    oracleQueueAccount: OracleQueueAccount
  ): Promise<CrankSchema> {
    const crankAccount = await CrankAccount.create(this._program, {
      name: Buffer.from(this.name),
      metadata: Buffer.from(""),
      queueAccount: oracleQueueAccount,
      maxRows: this.maxRows,
    });
    if (!crankAccount.keypair) throw new Error(`${this.name} missing keypair`);
    console.log(toAccountString(`${this.name}`, crankAccount));

    return plainToClass(CrankSchema, {
      ...this,
      secretKey: `[${crankAccount.keypair.secretKey}]`,
      publicKey: crankAccount.keypair.publicKey.toString(),
    });
  }
}

export class CrankSchema extends CrankDefinition {
  @Expose()
  public secretKey!: string;

  @Expose()
  public publicKey!: string;

  public toAccount(): CrankAccount {
    // const keypair = getKeypair(aggregator.keypair);
    const keypair = Keypair.fromSecretKey(unwrapSecretKey(this.secretKey));
    const aggregatorAccount = new CrankAccount({
      program: this._program,
      keypair,
    });
    return aggregatorAccount;
  }

  public async addFeed(
    aggregator: AggregatorSchema
  ): Promise<string | undefined> {
    const aggregatorAccount = aggregator.toAccount();
    try {
      await this.toAccount().push({
        aggregatorAccount,
      });
      console.log(`${aggregator.name} added to crank ${this.name}`);
      return this.name;
    } catch {
      console.log(`${chalk.red(aggregator.name, "not added to", this.name)}`);
    }
  }
}
export {};
