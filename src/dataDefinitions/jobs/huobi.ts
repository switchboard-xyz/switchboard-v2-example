import { OracleJob } from "@switchboard-xyz/switchboard-api";
import { multiplyUsdtTask } from "../task/multiplyUsdt";

export async function buildHuobiTask(
  pair: string
): Promise<Array<OracleJob.Task>> {
  const tasks = [
    OracleJob.Task.create({
      httpTask: OracleJob.HttpTask.create({
        url: `https://api.huobi.pro/market/detail/merged?symbol=${pair}`,
      }),
    }),
    OracleJob.Task.create({
      medianTask: OracleJob.MedianTask.create({
        tasks: [
          OracleJob.Task.create({
            jsonParseTask: OracleJob.JsonParseTask.create({
              path: "$.tick.bid[0]",
            }),
          }),
          OracleJob.Task.create({
            jsonParseTask: OracleJob.JsonParseTask.create({
              path: "$.tick.ask[0]",
            }),
          }),
        ],
      }),
    }),
  ];
  if (pair.toLowerCase().endsWith("usdt")) {
    tasks.push(await multiplyUsdtTask());
  }
  return tasks;
}