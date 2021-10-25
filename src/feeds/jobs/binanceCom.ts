import { OracleJob } from "@switchboard-xyz/switchboard-api";
import { multiplyUsdtTask } from "../task/multiplyUsdt";

export async function buildBinanceComTask(
  pair: string
): Promise<Array<OracleJob.Task>> {
  const tasks = [
    OracleJob.Task.create({
      httpTask: OracleJob.HttpTask.create({
        url: `https://www.binance.com/api/v3/ticker/price?symbol=${pair}`,
      }),
    }),
    OracleJob.Task.create({
      jsonParseTask: OracleJob.JsonParseTask.create({ path: "$.price" }),
    }),
  ];
  if (pair.toLowerCase().endsWith("usdt")) {
    tasks.push(await multiplyUsdtTask());
  }
  return tasks;
}
