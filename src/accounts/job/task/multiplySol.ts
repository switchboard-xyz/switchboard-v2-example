import { PublicKey } from "@solana/web3.js";
import { OracleJob } from "@switchboard-xyz/switchboard-api";

const SOL_PUBKEY = new PublicKey("");

export function multiplySolTask(): OracleJob.Task {
  return OracleJob.Task.create({
    multiplyTask: OracleJob.MultiplyTask.create({
      aggregatorPubkey: SOL_PUBKEY.toBase58(),
    }),
  });
}
