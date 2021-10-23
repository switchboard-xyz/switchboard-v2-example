import { PublicKey } from "@solana/web3.js";
import { OracleJob } from "@switchboard-xyz/switchboard-api";

const USDT_PUBKEY = new PublicKey("");

export function multiplyUsdtTask(): OracleJob.Task {
  return OracleJob.Task.create({
    multiplyTask: OracleJob.MultiplyTask.create({
      aggregatorPubkey: USDT_PUBKEY.toBase58(),
    }),
  });
}
