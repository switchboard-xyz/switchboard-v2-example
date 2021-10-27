import { AggregatorAccount } from "@switchboard-xyz/switchboard-v2";
import { OracleQueueSchema } from "../accounts";
import { selectFeed } from "../utils";
import { watchTransaction } from "../utils";

// TO DO: Map crank public keys to aggregator names
export async function aggregatorUpdate(
  schema: OracleQueueSchema
): Promise<void> {
  if (!schema.feeds) throw new Error("no feeds defined in schema");
  const aggregatorAccount: AggregatorAccount = await selectFeed(schema.feeds);
  const oracleQueueAccount = schema.toAccount();
  const payoutWallet = (await schema.oracles[0].toAccount().loadData())
    .tokenAccount;
  const txn = await aggregatorAccount.openRound({
    oracleQueueAccount,
    payoutWallet,
  });
  console.log(txn);
  await watchTransaction(txn);
}
