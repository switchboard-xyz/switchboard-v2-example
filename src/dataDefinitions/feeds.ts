import { plainToClass } from "class-transformer";
import { AggregatorDefinition, IAggregatorDefinition } from "../accounts";

export const USDT: IAggregatorDefinition = {
  name: "USDT_USD",
  batchSize: 1,
  minRequiredOracleResults: 1,
  minRequiredJobResults: 1,
  minUpdateDelaySeconds: 6,
  cranks: ["crank-1"],
  jobs: [
    {
      source: "kraken",
      id: "USDTZUSD",
    },
    {
      source: "binanceUs",
      id: "USDTUSD",
    },
    {
      source: "ftxUs",
      id: "usdt/usd",
    },
    {
      source: "ftxCom",
      id: "usdt/usd",
    },
  ],
};
export const USDT_FEED = plainToClass(AggregatorDefinition, USDT);

export const SOL: IAggregatorDefinition = {
  name: "SOL_USD",
  batchSize: 1,
  minRequiredOracleResults: 1,
  minRequiredJobResults: 1,
  minUpdateDelaySeconds: 6,
  cranks: ["crank-1"],
  jobs: [
    {
      source: "binanceCom",
      id: "SOLUSDT",
    },
    {
      source: "binanceUs",
      id: "SOLUSD",
    },
    {
      source: "bitfinex",
      id: "SOLUSD",
    },
    {
      source: "ftxCom",
      id: "SOL/USD",
    },
    {
      source: "ftxUs",
      id: "sol/usd",
    },
    {
      source: "huobi",
      id: "solusdt",
    },
    {
      source: "mxc",
      id: "SOL_USDT",
    },
    {
      source: "okex",
      id: "SOL-USDT",
    },
  ],
};
export const SOL_FEED = plainToClass(AggregatorDefinition, SOL);

export const BTC: IAggregatorDefinition = {
  name: "BTC_USD",
  batchSize: 1,
  minRequiredOracleResults: 1,
  minRequiredJobResults: 1,
  minUpdateDelaySeconds: 6,
  cranks: ["crank-1"],
  jobs: [
    {
      source: "bittrex",
      id: "btc-usd",
    },
    {
      source: "binanceCom",
      id: "BTCUSDT",
    },
    {
      source: "binanceUs",
      id: "BTCUSD",
    },
    {
      source: "bitfinex",
      id: "tBTCUSD",
    },
    {
      source: "bitstamp",
      id: "btcusd",
    },
    {
      source: "coinbase",
      id: "BTC-USD",
    },
    {
      source: "ftxCom",
      id: "BTC/USD",
    },
    {
      source: "ftxUs",
      id: "btc/usd",
    },
    {
      source: "huobi",
      id: "btcusdt",
    },
    {
      source: "kraken",
      id: "XXBTZUSD",
    },
    {
      source: "mxc",
      id: "BTC_USDT",
    },
    {
      source: "okex",
      id: "BTC-USDT",
    },
  ],
};
export const BTC_FEED = plainToClass(AggregatorDefinition, BTC);

/** AggregatorDefinitions needed for other, dependent job task */
export const DEFAULT_FEEDS: AggregatorDefinition[] = [
  USDT_FEED,
  SOL_FEED,
  BTC_FEED,
];
