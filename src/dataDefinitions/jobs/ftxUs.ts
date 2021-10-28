import { OracleJob } from "@switchboard-xyz/switchboard-api";

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
  return tasks;
}
