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

export async function getEthUsd(): Promise<FeedDefinition> {
  return {
    name: Buffer.from("ETH_USD"),
    batchSize: 1,
    minRequiredOracleResults: 1,
    minRequiredJobResults: 1,
    minUpdateDelaySeconds: 6,
    jobs: [
      await buildFtxComTask("ETH/USD"),
      await buildOkexTask("ETH-USDT"),
      await buildCoinbaseTask("ETH-USD"),
      await buildKrakenTask("XETHZUSD"),
      await buildBitstampTask("ethusd"),
      await buildFtxUsTask("eth/usd"),
      await buildBinanceComTask("ETHUSDT"),
      await buildBinanceUsTask("ETHUSD"),
      await buildHuobiTask("ethusdt"),
      await buildBitfinexTask("tETHUSD"),
      await buildMxcTask("ETH_USDT"),
      await buildBittrexTask("eth-usd"),
    ],
  };
}
