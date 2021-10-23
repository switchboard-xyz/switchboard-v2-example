import { buildKrakenTask, buildFtxUsTask, buildBinanceUsTask } from "./job";
import { OracleJob } from "@switchboard-xyz/switchboard-api";
import { FeedDefinition } from "../types";

export const USDT_USD: FeedDefinition = {
  name: Buffer.from("USDT_USD"),
  batchSize: 1,
  minRequiredOracleResults: 1,
  minRequiredJobResults: 1, // TODO:decrease
  minUpdateDelaySeconds: 6,
  jobs: [
    buildKrakenTask("USDTZUSD"),
    buildFtxUsTask("usdt/usd"),
    buildBinanceUsTask("USDTUSD"),

    [
      OracleJob.Task.create({
        httpTask: OracleJob.HttpTask.create({
          url: "https://ftx.com/api/markets/usdt/usd",
        }),
      }),
      OracleJob.Task.create({
        jsonParseTask: OracleJob.JsonParseTask.create({
          path: "$.result.price",
        }),
      }),
    ],
  ],
};
