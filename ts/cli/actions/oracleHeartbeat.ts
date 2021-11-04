import { OracleAccount } from "@switchboard-xyz/switchboard-v2";
import chalk from "chalk";
import { selectOracle, waitForever } from "../../utils";
import { OracleQueueSchema } from "../accounts";

// TO DO: Map crank public keys to aggregator names
export async function oracleHeartbeat(
  schema: OracleQueueSchema
): Promise<void> {
  if (!schema.oracles) throw new Error("no oracles defined in schema");
  const oracleAccount: OracleAccount = await selectOracle(schema.oracles);
  await oracleAccount.heartbeat();
  const oracleData = await oracleAccount.loadData();
  console.log(JSON.stringify(oracleData, undefined, 2));
  setInterval(async () => {
    try {
      await oracleAccount.heartbeat();
      console.log(chalk.green("heartbeat:"), new Date().toISOString());
    } catch (error) {
      console.error(error);
    }
  }, 5000);
  await waitForever();
}
