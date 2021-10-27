import { AggregatorAccount } from "@switchboard-xyz/switchboard-v2";
import { OracleQueueSchema } from "../accounts";
import { selectFeed } from "../utils";

// TO DO: Map crank public keys to aggregator names
export async function aggregatorResult(
  schema: OracleQueueSchema
): Promise<void> {
  if (!schema.feeds) throw new Error("no feeds defined in schema");
  const aggregatorAccount: AggregatorAccount = await selectFeed(schema.feeds);
  console.log(await aggregatorAccount.loadData());
  console.log(await aggregatorAccount.getLatestValue());
}
