import { OracleJob } from "@switchboard-xyz/switchboard-api";
import { multiplyUsdtTask } from "./multiplyUsdt";

export function buildKrakenTask(pair: string): Array<OracleJob.Task> {
  const tasks = [
    OracleJob.Task.create({
      httpTask: OracleJob.HttpTask.create({
        url: `https://api.kraken.com/0/public/Ticker?pair=${pair}`,
      }),
    }),
    OracleJob.Task.create({
      medianTask: OracleJob.MedianTask.create({
        tasks: [
          OracleJob.Task.create({
            jsonParseTask: OracleJob.JsonParseTask.create({
              path: `$.result.${pair}.a[0]`,
            }),
          }),
          OracleJob.Task.create({
            jsonParseTask: OracleJob.JsonParseTask.create({
              path: `$.result.${pair}.b[0]`,
            }),
          }),
          OracleJob.Task.create({
            jsonParseTask: OracleJob.JsonParseTask.create({
              path: `$.result.${pair}.c[0]`,
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
