import { FeedDefinition } from "../../types";
import {
  buildFtxComTask,
  buildOkexTask,
  buildFtxUsTask,
  buildBinanceComTask,
  buildBinanceUsTask,
  buildHuobiTask,
  buildBitfinexTask,
  buildMxcTask,
} from "./job";

export const SOL_USD: FeedDefinition = {
  name: Buffer.from("SOL_USD"),
  batchSize: 1,
  minRequiredOracleResults: 1,
  minRequiredJobResults: 1,
  minUpdateDelaySeconds: 6,
  jobs: [
    buildFtxComTask("SOL/USD"),
    buildOkexTask("SOL-USDT"),
    buildFtxUsTask("sol/usd"),
    buildBinanceComTask("SOLUSDT"),
    buildBinanceUsTask("SOLUSD"),
    buildHuobiTask("solusdt"),
    buildBitfinexTask("tSOLUSD"),
    buildMxcTask("SOL_USDT"),
  ],
};
