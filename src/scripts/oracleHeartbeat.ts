import { loadAnchor } from "../anchor";
import { getOracleAccount } from "../accounts";
import { toAccountString, waitForever } from "../utils";
import { setIntervalAsync } from "set-interval-async/dynamic";

async function oracleHeartbeat(): Promise<void> {
  const program = await loadAnchor();

  const oracleAccount = await getOracleAccount(program);
  console.log(toAccountString("Oracle Account", oracleAccount.publicKey));

  await oracleAccount.heartbeat();
  console.log(await oracleAccount.loadData());
  setIntervalAsync(async () => {
    await oracleAccount.heartbeat();
    console.log(await oracleAccount.loadData());
  }, 3 * 1000);
  await waitForever();

  return;
}

oracleHeartbeat().then(
  () => {
    process.exit();
  },
  (err) => {
    console.error(err);
    process.exit(-1);
  }
);

export {};
