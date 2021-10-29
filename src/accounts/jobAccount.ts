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
  _program: Promise<anchor.Program> = AnchorProgram.getInstance().program;

  @Exclude()
  _authority: Keypair = AnchorProgram.getInstance().authority;

  @Expose()
  public source!: EndpointEnum;

  @Expose()
  public id!: string;

  public async toSchema(
    aggregatorAccount: AggregatorAccount,
    usdtAggregator?: PublicKey
  ): Promise<JobSchema> {
    const tasks: OracleJob.Task[] = await this.mapJobTask();
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
    const jobAccount = await JobAccount.create(await this._program, {
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
        return buildBinanceComTask(this.id);
      case "binanceUs":
        return buildBinanceUsTask(this.id);
      case "bitfinex":
        return buildBitfinexTask(this.id);
      case "bitstamp":
        return buildBitstampTask(this.id);
      case "bittrex":
        return buildBittrexTask(this.id);
      case "coinbase":
        return buildCoinbaseTask(this.id);
      case "ftxUs":
        return buildFtxUsTask(this.id);
      case "ftxCom":
        return buildFtxComTask(this.id);
      case "huobi":
        return buildHuobiTask(this.id);
      case "kraken":
        return buildKrakenTask(this.id);
      case "kucoin":
        return buildKucoinTask(this.id);
      case "mxc":
        return buildMxcTask(this.id);
      case "okex":
        return buildOkexTask(this.id);
      case "orca":
        return buildOrcaApiTask(this.id);
    }
    return [] as OracleJob.Task[];
  }
}

export class JobSchema extends JobDefinition {
  @Expose()
  public secretKey!: string;

  @Expose()
  public publicKey!: string;

  public async toAccount(): Promise<JobAccount> {
    const keypair = Keypair.fromSecretKey(unwrapSecretKey(this.secretKey));
    const aggregatorAccount = new JobAccount({
      program: await this._program,
      keypair,
    });
    return aggregatorAccount;
  }
}
export {};
