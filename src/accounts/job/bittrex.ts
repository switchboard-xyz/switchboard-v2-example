import { OracleJob } from "@switchboard-xyz/switchboard-api";
import { multiplyUsdtTask } from "./task/multiplyUsdt";

export function buildBittrexTask(pair: string): Array<OracleJob.Task> {
  const tasks = [
    OracleJob.Task.create({
      httpTask: OracleJob.HttpTask.create({
        url: `https://api.bittrex.com/v3/markets/${pair}/ticker`,
      }),
    }),
    OracleJob.Task.create({
      medianTask: OracleJob.MedianTask.create({
        tasks: [
          OracleJob.Task.create({
            jsonParseTask: OracleJob.JsonParseTask.create({
              path: "$.askRate",
            }),
          }),
          OracleJob.Task.create({
            jsonParseTask: OracleJob.JsonParseTask.create({
              path: "$.bidRate",
            }),
          }),
          OracleJob.Task.create({
            jsonParseTask: OracleJob.JsonParseTask.create({
              path: "$.lastTradeRate",
            }),
          }),
        ],
      }),
    }),
  ];
  if (pair.toLowerCase().endsWith("usdt")) {
    tasks.push(multiplyUsdtTask());
  }
  return tasks;
}
