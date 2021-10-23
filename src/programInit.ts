import * as sbv2 from "@switchboard-xyz/switchboard-v2";
import * as anchor from "@project-serum/anchor";
import { loadAnchor } from "./utils/loadAnchor";
import {
  getProgramStateAccount,
  getOracleQueue,
  getOracleAccount,
  getPermissionAccount,
  getCrankAccount,
} from "./accounts";
import { toAccountString } from "./utils/toAccountString";

async function main(): Promise<void> {
  const { program, wallet } = await loadAnchor();

  const programStateAccount = await getProgramStateAccount(program);
  console.log(
    toAccountString("Program Account", programStateAccount.publicKey)
  );

  const oracleQueueAccount = await getOracleQueue(program, wallet.publicKey);
  console.log(
    toAccountString("Oracle Queue Account", oracleQueueAccount.publicKey)
  );

  const oracleAccount = await getOracleAccount(program, oracleQueueAccount);
  console.log(toAccountString("Oracle Account", oracleAccount.publicKey));

  const switchTokenMint = await programStateAccount.getTokenMint();
  console.log(toAccountString("Switch Token Mint", switchTokenMint.publicKey));

  const publisher = await switchTokenMint.createAccount(
    program.provider.wallet.publicKey
  );
  console.log(toAccountString("Publisher", publisher));

  const payerKeypair = wallet.payer;
  console.log(toAccountString("Payer", payerKeypair.publicKey));

  const amount = new anchor.BN(100000);
  await programStateAccount.vaultTransfer(publisher, payerKeypair, {
    amount,
  });
  console.log("Funded oracle account", amount.toNumber());

  const permissionAccount1 = await getPermissionAccount(
    program,
    wallet,
    oracleQueueAccount,
    oracleAccount
  );
  await permissionAccount1.set({
    authority: wallet.payer,
    permission: sbv2.SwitchboardPermission.PERMIT_ORACLE_HEARTBEAT,
    enable: true,
  });
  await oracleAccount.heartbeat();
  console.log(
    toAccountString("Permission Account", permissionAccount1.publicKey)
  );

  const crankAccount = await getCrankAccount(program, oracleQueueAccount);
  console.log(toAccountString("Crank Account", crankAccount.publicKey));

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
