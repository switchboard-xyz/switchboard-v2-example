import { OracleJob } from "@switchboard-xyz/switchboard-api";
import { multiplyUsdtTask } from "./multiplyUsdt";

export function buildCoinbaseTask(
  pair: string,
  maxDataAgeSeconds = 15
): Array<OracleJob.Task> {
  const tasks = [
    OracleJob.Task.create({
      websocketTask: OracleJob.WebsocketTask.create({
        url: "wss://ws-feed.pro.coinbase.com",
        subscription: JSON.stringify({
          type: "subscribe",
          product_ids: [pair],
          channels: [
            "ticker",
            {
              name: "ticker",
              product_ids: [pair],
            },
          ],
        }),
        maxDataAgeSeconds: maxDataAgeSeconds,
        filter: `$[?(@.type == 'ticker' && @.product_id == '${pair}')]`,
      }),
    }),
    OracleJob.Task.create({
      jsonParseTask: OracleJob.JsonParseTask.create({ path: "$.price" }),
    }),
  ];
  if (pair.toLowerCase().endsWith("usdt")) {
    tasks.push(multiplyUsdtTask());
  }
  return tasks;
}
