import * as sbv2 from "@switchboard-xyz/switchboard-v2";
import * as anchor from "@project-serum/anchor";
import { loadAnchor } from "../anchor";
import {
  getProgramStateAccount,
  getOracleQueue,
  getOracleAccount,
  getOracleQueuePermissionAccount,
  getCrankAccount,
} from "../accounts";
import chalk from "chalk";
import { getAuthorityKeypair } from "../accounts/authority/account";
import { getAllFeeds } from "../feeds";
import { Aggregator } from "../accounts/aggregator/aggregator";
import { sleep } from "../utils";
import { getUsdtUsd } from "../feeds/usdtUsd";

async function programInit(): Promise<void> {
  const program = await loadAnchor();
  const programStateAccount = await getProgramStateAccount(program);
  const payerKeypair = getAuthorityKeypair();

  const switchTokenMint = await programStateAccount.getTokenMint();
  const publisher = await switchTokenMint.createAccount(
    program.provider.wallet.publicKey
  );

  const amount = new anchor.BN(100000);
  await programStateAccount.vaultTransfer(publisher, payerKeypair, {
    amount,
  });
  console.log(
    chalk.green(`   -> Funding oracle account with ${amount.toNumber()} tokens`)
  );

  const oracleQueueAccount = await getOracleQueue(
    program,
    payerKeypair.publicKey
  );
  const oracleAccount = await getOracleAccount(program, oracleQueueAccount);

  const permissionAccount = await getOracleQueuePermissionAccount(
    program,
    payerKeypair.publicKey,
    oracleQueueAccount,
    oracleAccount
  );
  await permissionAccount.set({
    authority: payerKeypair,
    permission: sbv2.SwitchboardPermission.PERMIT_ORACLE_HEARTBEAT,
    enable: true,
  });
  await oracleAccount.heartbeat();

  const crankAccount = await getCrankAccount(program, oracleQueueAccount);

  // need to create usdt feed first as other feeds might need the public key for job definitions
  const aggregatorAccounts: Aggregator[] = [];
  const usdt = new Aggregator(program, await getUsdtUsd()); // load from local storage
  if (usdt.account === null) {
    await usdt.create(oracleQueueAccount); // create a new account on-chain
    await sleep(2000); // need enough time for new account to be detected
  }
  const err = await usdt.verifyJobs();
  if (err) throw err;
  await usdt.permitToQueue(payerKeypair);
  await usdt.fundLease(100, publisher, payerKeypair);
  await usdt.addToCrank(crankAccount);
  aggregatorAccounts.push(usdt);

  const allFeeds = await getAllFeeds();
  for await (const f of allFeeds) {
    const agg = new Aggregator(program, f); // load from local storage
    if (agg.account === null) {
      await agg.create(oracleQueueAccount); // create a new account on-chain
      await sleep(2000); // need enough time for new account to be detected
    }
    const err = await agg.verifyJobs();
    if (err) throw err;
    await agg.permitToQueue(payerKeypair);
    await agg.fundLease(100, publisher, payerKeypair);
    await agg.addToCrank(crankAccount);
    aggregatorAccounts.push(agg);
  }

  return;
}

programInit().then(
  () => {
    process.exit();
  },
  (err) => {
    console.error(err);
    process.exit(-1);
  }
);

export {};
