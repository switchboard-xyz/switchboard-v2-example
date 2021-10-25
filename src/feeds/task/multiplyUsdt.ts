import { OracleJob } from "@switchboard-xyz/switchboard-api";
import { loadAggregatorAccount } from "../../accounts/aggregator/account";
import { ConfigError } from "../../types";

// const USDT_PUBKEY = new PublicKey(
//   "5mp8kbkTYwWWCsKSte8rURjTuyinsqBpJ9xAQsewPDD"
// );

export async function multiplyUsdtTask(): Promise<OracleJob.Task> {
  const usdtAccount = await loadAggregatorAccount("USDT_USD");
  if (!usdtAccount?.publicKey)
    throw new ConfigError("failed to get USDT public key");
  return OracleJob.Task.create({
    multiplyTask: OracleJob.MultiplyTask.create({
      aggregatorPubkey: usdtAccount.publicKey.toBase58(),
    }),
  });
}
