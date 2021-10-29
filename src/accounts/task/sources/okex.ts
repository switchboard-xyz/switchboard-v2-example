import { OracleJob } from "@switchboard-xyz/switchboard-api";

export async function buildOkexTask(
  pair: string,
  maxDataAgeSeconds = 15
): Promise<OracleJob.Task[]> {
  const tasks = [
    OracleJob.Task.create({
      websocketTask: OracleJob.WebsocketTask.create({
        url: "wss://ws.okex.com:8443/ws/v5/public",
        subscription: JSON.stringify({
          op: "subscribe",
          args: [{ channel: "tickers", instId: pair }],
        }),
        maxDataAgeSeconds: maxDataAgeSeconds,
        filter:
          "$[?(" +
          `@.event != 'subscribe' && ` +
          `@.arg.channel == 'tickers' && ` +
          `@.arg.instId == '${pair}' && ` +
          `@.data[0].instType == 'SPOT' && ` +
          `@.data[0].instId == '${pair}')]`,
      }),
    }),
    OracleJob.Task.create({
      medianTask: OracleJob.MedianTask.create({
        tasks: [
          OracleJob.Task.create({
            jsonParseTask: OracleJob.JsonParseTask.create({
              path: "$.data[0].bidPx",
            }),
          }),
          OracleJob.Task.create({
            jsonParseTask: OracleJob.JsonParseTask.create({
              path: "$.data[0].askPx",
            }),
          }),
          OracleJob.Task.create({
            jsonParseTask: OracleJob.JsonParseTask.create({
              path: "$.data[0].last",
            }),
          }),
        ],
      }),
    }),
  ];
  return tasks;
}