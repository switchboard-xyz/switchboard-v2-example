import { OracleJob } from "@switchboard-xyz/switchboard-api";

export async function buildOrcaApiTask(
  pair: string
): Promise<OracleJob.Task[]> {
  const tasks = [
    OracleJob.Task.create({
      httpTask: OracleJob.HttpTask.create({
        url: `https://api.orca.so/pools`,
      }),
    }),
    OracleJob.Task.create({
      jsonParseTask: OracleJob.JsonParseTask.create({
        path: `$[?(@.name == '${pair}[aquafarm]')].price`,
      }),
    }),
  ];
  return tasks;
}
