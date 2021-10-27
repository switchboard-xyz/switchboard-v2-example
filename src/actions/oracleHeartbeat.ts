import { OracleAccount } from "@switchboard-xyz/switchboard-v2";
import { OracleQueueSchema } from "../accounts";
import { selectOracle, waitForever } from "../utils";
import { setIntervalAsync } from "set-interval-async/dynamic";

// TO DO: Map crank public keys to aggregator names
export async function oracleHeartbeat(
  schema: OracleQueueSchema
): Promise<void> {
  if (!schema.oracles) throw new Error("no oracles defined in schema");
  const oracleAccount: OracleAccount = await selectOracle(schema.oracles);
  await oracleAccount.heartbeat();
  console.log(await oracleAccount.loadData());
  setIntervalAsync(async () => {
    await oracleAccount.heartbeat();
    console.log(await oracleAccount.loadData());
  }, 3 * 1000);
  await waitForever();
}
