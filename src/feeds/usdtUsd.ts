import { buildKrakenTask, buildFtxUsTask, buildBinanceUsTask } from "./jobs";
import { OracleJob } from "@switchboard-xyz/switchboard-api";
import { FeedDefinition } from "../types";

export async function getUsdtUsd(): Promise<FeedDefinition> {
  return {
    name: Buffer.from("USDT_USD"),
    batchSize: 1,
    minRequiredOracleResults: 1,
    minRequiredJobResults: 1, // TODO:decrease
    minUpdateDelaySeconds: 6,
    jobs: [
      await buildKrakenTask("USDTZUSD"),
      await buildFtxUsTask("usdt/usd"),
      await buildBinanceUsTask("USDTUSD"),

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
}
