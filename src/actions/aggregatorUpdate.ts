import { AggregatorAccount } from "@switchboard-xyz/switchboard-v2";
import { OracleQueueSchema } from "../accounts";
import { selectFeed, watchTransaction } from "../utils";

// TO DO: Map crank public keys to aggregator names
export async function aggregatorUpdate(
  schema: OracleQueueSchema
): Promise<void> {
  if (!schema.feeds) throw new Error("no feeds defined in schema");
  const aggregatorAccount: AggregatorAccount = await selectFeed(schema.feeds);
  const oracleQueueAccount = await schema.toAccount();
  const payoutWallet = await schema.getAuthorityTokenAccount();
  const txn = await aggregatorAccount.openRound({
    oracleQueueAccount,
    payoutWallet,
  });
  await watchTransaction(txn);
}
