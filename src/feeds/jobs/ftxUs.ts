import { OracleJob } from "@switchboard-xyz/switchboard-api";
import { multiplyUsdtTask } from "../task/multiplyUsdt";

export async function buildFtxUsTask(
  pair: string
): Promise<Array<OracleJob.Task>> {
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
    tasks.push(await multiplyUsdtTask());
  }
  return tasks;
}
