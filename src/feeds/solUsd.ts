import { FeedDefinition } from "../types";
import {
  buildFtxComTask,
  buildOkexTask,
  buildFtxUsTask,
  buildBinanceComTask,
  buildBinanceUsTask,
  buildHuobiTask,
  buildBitfinexTask,
  buildMxcTask,
} from "./jobs";

export async function getSolUsd(): Promise<FeedDefinition> {
  return {
    name: Buffer.from("SOL_USD"),
    batchSize: 1,
    minRequiredOracleResults: 1,
    minRequiredJobResults: 1,
    minUpdateDelaySeconds: 6,
    jobs: [
      await buildFtxComTask("SOL/USD"),
      await buildOkexTask("SOL-USDT"),
      await buildFtxUsTask("sol/usd"),
      await buildBinanceComTask("SOLUSDT"),
      await buildBinanceUsTask("SOLUSD"),
      await buildHuobiTask("solusdt"),
      await buildBitfinexTask("tSOLUSD"),
      await buildMxcTask("SOL_USDT"),
    ],
  };
}
