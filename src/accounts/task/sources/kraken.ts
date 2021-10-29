import { OracleJob } from "@switchboard-xyz/switchboard-api";

export async function buildKrakenTask(pair: string): Promise<OracleJob.Task[]> {
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
  return tasks;
}
