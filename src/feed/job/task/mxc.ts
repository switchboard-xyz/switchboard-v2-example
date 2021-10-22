import { OracleJob } from "@switchboard-xyz/switchboard-api";
import { multiplyUsdtTask } from "./multiplyUsdt";

export function buildMxcTask(pair: string): Array<OracleJob.Task> {
  const tasks = [
    OracleJob.Task.create({
      httpTask: OracleJob.HttpTask.create({
        url: `https://www.mxc.com/open/api/v2/market/ticker?symbol=${pair}`,
      }),
    }),
    OracleJob.Task.create({
      medianTask: OracleJob.MedianTask.create({
        tasks: [
          OracleJob.Task.create({
            jsonParseTask: OracleJob.JsonParseTask.create({
              path: "$.data[0].ask",
            }),
          }),
          OracleJob.Task.create({
            jsonParseTask: OracleJob.JsonParseTask.create({
              path: "$.data[0].bid",
            }),
          }),
          OracleJob.Task.create({
            jsonParseTask: OracleJob.JsonParseTask.create({
              path: "$.data[0].last",
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
