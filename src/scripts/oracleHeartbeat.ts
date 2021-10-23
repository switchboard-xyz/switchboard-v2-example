import { loadAnchor } from "../anchor";
import { getOracleAccount } from "../accounts";
import { toAccountString } from "../utils";
import { EventEmitter } from "events";
import { waitFor } from "wait-for-event";
import { setIntervalAsync } from "set-interval-async/dynamic";

function waitForever(): Promise<void> {
  return waitFor("", new EventEmitter());
}

async function main(): Promise<void> {
  const { program } = await loadAnchor();

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

main().then(
  () => {
    process.exit();
  },
  (err) => {
    console.error(err);
    process.exit(-1);
  }
);

export {};
