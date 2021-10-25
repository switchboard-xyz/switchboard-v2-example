import { PublicKey } from "@solana/web3.js";
import { OracleJob } from "@switchboard-xyz/switchboard-api";

// const SOL_PUBKEY = new PublicKey(
//   "AdtRGGhmqvom3Jemp5YNrxd9q9unX36BZk1pujkkXijL"
// );

export function multiplySolTask(solPubKey: PublicKey): OracleJob.Task {
  return OracleJob.Task.create({
    multiplyTask: OracleJob.MultiplyTask.create({
      aggregatorPubkey: solPubKey.toBase58(),
    }),
  });
}
