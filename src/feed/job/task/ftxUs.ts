import { OracleJob } from "@switchboard-xyz/switchboard-api";
import { multiplyUsdtTask } from "./multiplyUsdt";

export function buildFtxUsTask(pair: string): Array<OracleJob.Task> {
  const tasks = [
    OracleJob.Task.create({
      httpTask: OracleJob.HttpTask.create({
        url: `https://ftx.us/api/markets/${pair}`,
      }),
    }),
    OracleJob.Task.create({
      jsonParseTask: OracleJob.JsonParseTask.create({ path: "$.result.price" }),
    }),
  ];
  if (pair.toLowerCase().endsWith("usdt")) {
    tasks.push(multiplyUsdtTask());
  }
  return tasks;
}
