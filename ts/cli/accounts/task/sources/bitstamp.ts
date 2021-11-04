import { OracleJob } from "@switchboard-xyz/switchboard-api";

export async function buildBitstampTask(
  pair: string
): Promise<OracleJob.Task[]> {
  const tasks = [
    OracleJob.Task.create({
      httpTask: OracleJob.HttpTask.create({
        url: `https://www.bitstamp.net/api/v2/ticker/${pair}`,
      }),
    }),
    OracleJob.Task.create({
      medianTask: OracleJob.MedianTask.create({
        tasks: [
          OracleJob.Task.create({
            jsonParseTask: OracleJob.JsonParseTask.create({ path: "$.ask" }),
          }),
          OracleJob.Task.create({
            jsonParseTask: OracleJob.JsonParseTask.create({ path: "$.bid" }),
          }),
          OracleJob.Task.create({
            jsonParseTask: OracleJob.JsonParseTask.create({ path: "$.last" }),
          }),
        ],
      }),
    }),
  ];
  return tasks;
}
