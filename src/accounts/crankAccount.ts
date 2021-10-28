import * as anchor from "@project-serum/anchor";
import { SendTxRequest } from "@project-serum/anchor/dist/cjs/provider";
import { Keypair, PublicKey } from "@solana/web3.js";
import {
  CrankAccount,
  OracleQueueAccount,
} from "@switchboard-xyz/switchboard-v2";
import chalk from "chalk";
import { Exclude, Expose, plainToClass } from "class-transformer";
import { AggregatorSchema } from ".";
import { AnchorProgram, unwrapSecretKey } from "../types";
import { toAccountString, watchTransaction } from "../utils";
export interface PqData {
  pubkey: PublicKey;
  nextTimestamp: anchor.BN;
}

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

  public async readFeeds(): Promise<PqData[]> {
    const zeroKey = new PublicKey("11111111111111111111111111111111");
    const feeds: PqData[] = (await this.toAccount().loadData()).pqData.filter(
      (f: PqData) => !f.pubkey.equals(zeroKey)
    );
    return feeds;
  }

  public async turnCrank(
    queueAccount: OracleQueueAccount,
    payoutWallet: PublicKey
  ): Promise<void> {
    const queueAuthority = AnchorProgram.getInstance().authority.publicKey;
    const crankAccount = this.toAccount();
    try {
      const readyPubkeys = await crankAccount.peakNextReady(5);
      const txns: SendTxRequest[] = [];
      for (let index = 0; index < readyPubkeys.length; ++index) {
        txns.push({
          tx: await crankAccount.popTxn({
            payoutWallet,
            queuePubkey: queueAccount.publicKey,
            queueAuthority,
            readyPubkeys,
            nonce: index,
          }),
          signers: [],
        });
      }
      const signatures = await this._program.provider.sendAll(txns);
      console.log("Crank turned");
      await Promise.all(signatures.map(async (s) => watchTransaction(s)));
    } catch (error) {
      console.log(chalk.red("Crank turn failed"), error);
    }
  }
}
export {};
