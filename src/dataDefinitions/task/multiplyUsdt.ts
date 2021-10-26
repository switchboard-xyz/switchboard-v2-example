import { PublicKey } from "@solana/web3.js";
import { OracleJob } from "@switchboard-xyz/switchboard-api";

const USDT_PUBKEY = new PublicKey(
  "5mp8kbkTYwWWCsKSte8rURjTuyinsqBpJ9xAQsewPDD"
);

export async function multiplyUsdtTask(): Promise<OracleJob.Task> {
  const usdtAccount = USDT_PUBKEY;
  if (!usdtAccount) throw new Error("failed to get USDT public key");
  return OracleJob.Task.create({
    multiplyTask: OracleJob.MultiplyTask.create({
      aggregatorPubkey: usdtAccount.toBase58(),
    }),
  });
}
