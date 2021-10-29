import { PublicKey } from "@solana/web3.js";
import { OracleJob } from "@switchboard-xyz/switchboard-api";

export function multiplySolTask(solPubKey: PublicKey): OracleJob.Task {
  return OracleJob.Task.create({
    multiplyTask: OracleJob.MultiplyTask.create({
      aggregatorPubkey: solPubKey.toBase58(),
    }),
  });
}
