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
import { OracleJob } from "@switchboard-xyz/switchboard-api";

export async function getJobTask(
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
