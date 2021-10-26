import { PublicKey } from "@solana/web3.js";
import { OracleJob } from "@switchboard-xyz/switchboard-api";
import { multiplyUsdtTask } from "../task/multiplyUsdt";

export async function buildOrcaLpTask(
  key: string,
  solKey: PublicKey
): Promise<Array<OracleJob.Task>> {
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
  // if (pair.toLowerCase().endsWith("usdt")) {
  //   tasks.push(await multiplyUsdtTask());
  // }
  return tasks;
}
