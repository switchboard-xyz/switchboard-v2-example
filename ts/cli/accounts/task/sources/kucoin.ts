import { OracleJob } from "@switchboard-xyz/switchboard-api";

export async function buildKucoinTask(pair: string): Promise<OracleJob.Task[]> {
  return [
    OracleJob.Task.create({
      httpTask: OracleJob.HttpTask.create({
        url: `https://api.kucoin.com/api/v1/market/orderbook/level1?symbol=${pair}`,
      }),
    }),
    OracleJob.Task.create({
      jsonParseTask: OracleJob.JsonParseTask.create({ path: `$.data.price` }),
    }),
  ];
}
