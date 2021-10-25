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
import { getAuthorityKeypair } from "../accounts/authority/keypair";
import { AggregatorAccount } from "@switchboard-xyz/switchboard-v2";
import { getAggregatorAccount } from "../accounts/aggregator/account";
import { ALL_FEEDS } from "../accounts/aggregator";

async function main(): Promise<void> {
  const program = await loadAnchor();

  const programStateAccount = await getProgramStateAccount(program);
  const payerKeypair = getAuthorityKeypair();
  const oracleQueueAccount = await getOracleQueue(
    program,
    payerKeypair.publicKey
  );
  const oracleAccount = await getOracleAccount(program, oracleQueueAccount);
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

  const permissionAccount1 = await getOracleQueuePermissionAccount(
    program,
    payerKeypair.publicKey,
    oracleQueueAccount,
    oracleAccount
  );
  await permissionAccount1.set({
    authority: payerKeypair,
    permission: sbv2.SwitchboardPermission.PERMIT_ORACLE_HEARTBEAT,
    enable: true,
  });
  await oracleAccount.heartbeat();

  const crankAccount = await getCrankAccount(program, oracleQueueAccount);

  const aggAccounts: AggregatorAccount[] = [];
  for await (const f of ALL_FEEDS) {
    aggAccounts.push(
      await getAggregatorAccount(f, program, oracleQueueAccount)
    );
  }
  console.log(aggAccounts);
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
