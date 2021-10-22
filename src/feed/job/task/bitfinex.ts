import { OracleJob } from "@switchboard-xyz/switchboard-api";
import { multiplyUsdtTask } from "./multiplyUsdt";

export function buildBitfinexTask(pair: string): Array<OracleJob.Task> {
  const tasks = [
    OracleJob.Task.create({
      httpTask: OracleJob.HttpTask.create({
        url: `https://api-pub.bitfinex.com/v2/tickers?symbols=${pair}`,
      }),
    }),
    OracleJob.Task.create({
      medianTask: OracleJob.MedianTask.create({
        tasks: [
          OracleJob.Task.create({
            jsonParseTask: OracleJob.JsonParseTask.create({ path: "$[0][1]" }),
          }),
          OracleJob.Task.create({
            jsonParseTask: OracleJob.JsonParseTask.create({ path: "$[0][3]" }),
          }),
          OracleJob.Task.create({
            jsonParseTask: OracleJob.JsonParseTask.create({ path: "$[0][7]" }),
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
