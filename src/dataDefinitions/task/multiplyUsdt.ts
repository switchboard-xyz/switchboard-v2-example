import { PublicKey } from "@solana/web3.js";
import { OracleJob } from "@switchboard-xyz/switchboard-api";

export async function multiplyUsdtTask(
  usdtAggregator: PublicKey
): Promise<OracleJob.Task> {
  if (!usdtAggregator) throw new Error("failed to get USDT public key");
  return OracleJob.Task.create({
    multiplyTask: OracleJob.MultiplyTask.create({
      aggregatorPubkey: usdtAggregator.toBase58(),
    }),
  });
}
