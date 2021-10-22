import { PublicKey } from "@solana/web3.js";
import { OracleJob } from "@switchboard-xyz/switchboard-api";

export function buildOrcaApiTask(
  key: string,
  solKey: PublicKey
): Array<OracleJob.Task> {
  const tasks = [
    OracleJob.Task.create({
      lpExchangeRateTask: OracleJob.LpExchangeRateTask.create({
        saberPoolAddress: key,
      }),
    }),
    OracleJob.Task.create({
      multiplyTask: OracleJob.MultiplyTask.create({
        aggregatorPubkey: solKey.toBase58(),
      }),
    }),
  ];
  //   if (pair.toLowerCase().endsWith("usdt")) {
  //     tasks.push(
  //       OracleJob.Task.create({
  //         multiplyTask: OracleJob.MultiplyTask.create({
  //           aggregatorPubkey: USDT_PUBKEY().toBase58(),
  //         }),
  //       })
  //     );
  //   }
  return tasks;
}
