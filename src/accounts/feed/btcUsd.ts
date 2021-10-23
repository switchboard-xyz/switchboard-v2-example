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
} from "../job";

export const BTC_USD: FeedDefinition = {
  name: Buffer.from("BTC_USD"),
  batchSize: 1,
  minRequiredOracleResults: 1,
  minRequiredJobResults: 1,
  minUpdateDelaySeconds: 6,
  jobs: [
    buildFtxComTask("BTC/USD"),
    buildOkexTask("BTC-USDT"),
    buildCoinbaseTask("BTC-USD"),
    buildKrakenTask("XXBTZUSD"),
    buildBitstampTask("btcusd"),
    buildFtxUsTask("btc/usd"),
    buildBinanceComTask("BTCUSDT"),
    buildBinanceUsTask("BTCUSD"),
    buildHuobiTask("btcusdt"),
    buildBitfinexTask("tBTCUSD"),
    buildMxcTask("BTC_USDT"),
    buildBittrexTask("btc-usd"),
  ],
};
