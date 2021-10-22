import { OracleJob } from "@switchboard-xyz/switchboard-api";

export function monkeyBusinessFloorPrice(): Array<OracleJob.Task> {
  return [
    OracleJob.Task.create({
      httpTask: {
        url: `https://market.solanamonkey.business/.netlify/functions/fetchOffers`,
      },
    }),
    OracleJob.Task.create({
      jsonParseTask: {
        path: `$.offers[?(@.price)].price`,
        aggregationMethod: OracleJob.JsonParseTask.AggregationMethod.MIN,
      },
    }),
  ];
}
