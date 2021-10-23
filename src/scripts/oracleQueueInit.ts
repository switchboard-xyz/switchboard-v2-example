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

async function main(): Promise<void> {
  const { program, authority } = await loadAnchor();

  const programStateAccount = await getProgramStateAccount(program);
  const oracleQueueAccount = await getOracleQueue(program, authority.publicKey);
  const oracleAccount = await getOracleAccount(program, oracleQueueAccount);
  const switchTokenMint = await programStateAccount.getTokenMint();
  const publisher = await switchTokenMint.createAccount(
    program.provider.wallet.publicKey
  );
  const payerKeypair = authority.payer;

  const amount = new anchor.BN(100000);
  await programStateAccount.vaultTransfer(publisher, payerKeypair, {
    amount,
  });
  console.log(
    chalk.green(`   -> Funding oracle account with ${amount.toNumber()} tokens`)
  );

  const permissionAccount1 = await getOracleQueuePermissionAccount(
    program,
    authority,
    oracleQueueAccount,
    oracleAccount
  );
  await permissionAccount1.set({
    authority: authority.payer,
    permission: sbv2.SwitchboardPermission.PERMIT_ORACLE_HEARTBEAT,
    enable: true,
  });
  await oracleAccount.heartbeat();

  const crankAccount = await getCrankAccount(program, oracleQueueAccount);

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
