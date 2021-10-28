import { OracleJob } from "@switchboard-xyz/switchboard-api";

export async function buildFtxComTask(
  pair: string,
  maxDataAgeSeconds = 15
): Promise<Array<OracleJob.Task>> {
  const tasks = [
    OracleJob.Task.create({
      websocketTask: OracleJob.WebsocketTask.create({
        url: "wss://ftx.com/ws/",
        subscription: JSON.stringify({
          op: "subscribe",
          channel: "ticker",
          market: pair,
        }),
        maxDataAgeSeconds: maxDataAgeSeconds,
        filter: `$[?(@.type == 'update' && @.channel == 'ticker' && @.market == '${pair}')]`,
      }),
    }),
    OracleJob.Task.create({
      medianTask: OracleJob.MedianTask.create({
        tasks: [
          OracleJob.Task.create({
            jsonParseTask: OracleJob.JsonParseTask.create({
              path: "$.data.bid",
            }),
          }),
          OracleJob.Task.create({
            jsonParseTask: OracleJob.JsonParseTask.create({
              path: "$.data.ask",
            }),
          }),
          OracleJob.Task.create({
            jsonParseTask: OracleJob.JsonParseTask.create({
              path: "$.data.last",
            }),
          }),
        ],
      }),
    }),
  ];
  return tasks;
}
