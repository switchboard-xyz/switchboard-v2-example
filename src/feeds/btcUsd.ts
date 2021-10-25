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
  buildCoinbaseTask,
  buildKrakenTask,
  buildBitstampTask,
  buildBittrexTask,
} from "./jobs";

export async function getBtcUsd(): Promise<FeedDefinition> {
  return {
    name: Buffer.from("BTC_USD"),
    batchSize: 1,
    minRequiredOracleResults: 1,
    minRequiredJobResults: 1,
    minUpdateDelaySeconds: 6,
    jobs: [
      await buildFtxComTask("BTC/USD"),
      await buildOkexTask("BTC-USDT"),
      await buildCoinbaseTask("BTC-USD"),
      await buildKrakenTask("XXBTZUSD"),
      await buildBitstampTask("btcusd"),
      await buildFtxUsTask("btc/usd"),
      await buildBinanceComTask("BTCUSDT"),
      await buildBinanceUsTask("BTCUSD"),
      await buildHuobiTask("btcusdt"),
      await buildBitfinexTask("tBTCUSD"),
      await buildMxcTask("BTC_USDT"),
      await buildBittrexTask("btc-usd"),
    ],
  };
}
