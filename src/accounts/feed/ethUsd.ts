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
  buildCoinbaseTask,
  buildKrakenTask,
  buildBitstampTask,
  buildBittrexTask,
} from "./job";

export const ETH_USD: FeedDefinition = {
  name: Buffer.from("ETH_USD"),
  batchSize: 1,
  minRequiredOracleResults: 1,
  minRequiredJobResults: 1,
  minUpdateDelaySeconds: 6,
  jobs: [
    buildFtxComTask("ETH/USD"),
    buildOkexTask("ETH-USDT"),
    buildCoinbaseTask("ETH-USD"),
    buildKrakenTask("XETHZUSD"),
    buildBitstampTask("ethusd"),
    buildFtxUsTask("eth/usd"),
    buildBinanceComTask("ETHUSDT"),
    buildBinanceUsTask("ETHUSD"),
    buildHuobiTask("ethusdt"),
    buildBitfinexTask("tETHUSD"),
    buildMxcTask("ETH_USDT"),
    buildBittrexTask("eth-usd"),
  ],
};
