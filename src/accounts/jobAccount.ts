import * as anchor from "@project-serum/anchor";
import { Keypair, PublicKey } from "@solana/web3.js";
import { OracleJob } from "@switchboard-xyz/switchboard-api";
import { AggregatorAccount, JobAccount } from "@switchboard-xyz/switchboard-v2";
import { Exclude, Expose, plainToClass } from "class-transformer";
import {
  buildBinanceComTask,
  buildBinanceUsTask,
  buildBitfinexTask,
  buildBitstampTask,
  buildBittrexTask,
  buildCoinbaseTask,
  buildFtxComTask,
  buildFtxUsTask,
  buildHuobiTask,
  buildKrakenTask,
  buildKucoinTask,
  buildMxcTask,
  buildOkexTask,
  buildOrcaApiTask,
} from "../dataDefinitions/jobs";
import { multiplyUsdtTask } from "../dataDefinitions/task/multiplyUsdt";
import { AnchorProgram, unwrapSecretKey } from "../types";

export type EndpointEnum =
  | "binanceCom"
  | "binanceUs"
  | "bitfinex"
  | "bitstamp"
  | "bittrex"
  | "coinbase"
  | "ftxCom"
  | "ftxUs"
  | "huobi"
  | "kraken"
  | "kucoin"
  | "mxc"
  | "okex"
  | "orca"
  | "orcaLp";

export interface IJobDefinition {
  source: EndpointEnum;
  id: string;
}

export class JobDefinition {
  @Exclude()
  _program: anchor.Program = AnchorProgram.getInstance().program;
  @Expose()
  public source!: EndpointEnum;
  @Expose()
  public id!: string;

  public async toSchema(
    aggregatorAccount: AggregatorAccount,
    usdtAggregator?: PublicKey
  ): Promise<JobSchema> {
    const tasks = await this.mapJobTask();
    if (this.id.toLowerCase().endsWith("usdt")) {
      if (usdtAggregator) tasks.push(await multiplyUsdtTask(usdtAggregator));
      else
        throw new Error(
          `need to define USDT Aggregator pubkey before creating job ${this.source} with id ${this.id}`
        );
    }
    const data = Buffer.from(
      OracleJob.encodeDelimited(
        OracleJob.create({
          tasks,
        })
      ).finish()
    );
    const keypair = anchor.web3.Keypair.generate();
    const jobAccount = await JobAccount.create(this._program, {
      data,
      keypair,
    });
    await aggregatorAccount.addJob(jobAccount);
    // console.log(toAccountString(`${this.source}-job-account`, jobAccount));
    return plainToClass(JobSchema, {
      ...this,
      secretKey: `[${keypair.secretKey}]`,
      publicKey: keypair.publicKey.toString(),
    });
  }
  private async mapJobTask(): Promise<OracleJob.Task[]> {
    switch (this.source) {
      case "binanceCom":
        return await buildBinanceComTask(this.id);
      case "binanceUs":
        return await buildBinanceUsTask(this.id);
      case "bitfinex":
        return await buildBitfinexTask(this.id);
      case "bitstamp":
        return await buildBitstampTask(this.id);
      case "bittrex":
        return await buildBittrexTask(this.id);
      case "coinbase":
        return await buildCoinbaseTask(this.id);
      case "ftxUs":
        return await buildFtxUsTask(this.id);
      case "ftxCom":
        return await buildFtxComTask(this.id);
      case "huobi":
        return await buildHuobiTask(this.id);
      case "kraken":
        return await buildKrakenTask(this.id);
      case "kucoin":
        return await buildKucoinTask(this.id);
      case "mxc":
        return await buildMxcTask(this.id);
      case "okex":
        return await buildOkexTask(this.id);
      case "orca":
        return await buildOrcaApiTask(this.id);
    }
    return [] as OracleJob.Task[];
  }
}

export class JobSchema extends JobDefinition {
  @Expose()
  public secretKey!: string;
  @Expose()
  public publicKey!: string;

  public toAccount(): JobAccount {
    const keypair = Keypair.fromSecretKey(unwrapSecretKey(this.secretKey));
    const aggregatorAccount = new JobAccount({
      program: this._program,
      keypair,
    });
    return aggregatorAccount;
  }
}
export {};
