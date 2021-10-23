/**
 * Entry point to the program with CLI options to perform various tasks
 * - Create jobs & feeds from json input file 
 *

 */
import * as sbv2 from "@switchboard-xyz/switchboard-v2";
import * as anchor from "@project-serum/anchor";
import { getConfig } from "./config";
import { getProgramState } from "./program";
import { getOracleQueue } from "./oracle/oracleQueue";
import { getOracleAccount } from "./oracle/oracleAccount";
import { writeSecretKey } from "./utils/writeSecretKey";
import chalk from "chalk";
import { PublicKey } from "@solana/web3.js";

const chalkString = (label: string, publicKey: PublicKey): string => {
  return `${chalk.blue(label)}: ${chalk.yellow(publicKey)}`;
};

async function main(): Promise<void> {
  const { program, wallet } = await getConfig();

  const programStateAccount = await getProgramState(program);
  console.log(chalkString("Program Account", programStateAccount.publicKey));

  const oracleQueueAccount = await getOracleQueue(program, wallet.publicKey);
  console.log(
    chalkString("Oracle Queue Account", oracleQueueAccount.publicKey)
  );

  const oracleAccount = await getOracleAccount(program, oracleQueueAccount);
  console.log(chalkString("Oracle Account", oracleAccount.publicKey));

  const switchTokenMint = await programStateAccount.getTokenMint();
  console.log(chalkString("Switch Token Mint", switchTokenMint.publicKey));

  const publisher = await switchTokenMint.createAccount(
    program.provider.wallet.publicKey
  );
  console.log(chalkString("Publisher", publisher));

  const payerKeypair = wallet.payer;
  console.log(chalkString("Payer", payerKeypair.publicKey));

  await programStateAccount.vaultTransfer(publisher, payerKeypair, {
    amount: new anchor.BN(100000),
  });
  console.log("Funded oracle account");

  const permissionAccount1 = await sbv2.PermissionAccount.create(program, {
    authority: wallet.publicKey,
    granter: oracleQueueAccount.publicKey,
    grantee: oracleAccount.publicKey,
  });
  await permissionAccount1.set({
    authority: wallet.payer,
    permission: sbv2.SwitchboardPermission.PERMIT_ORACLE_HEARTBEAT,
    enable: true,
  });
  await oracleAccount.heartbeat();
  console.log(chalkString("Permission Account", permissionAccount1.publicKey));

  const crankAccount = await sbv2.CrankAccount.create(program, {
    name: Buffer.from("crank1"),
    metadata: Buffer.from(""),
    queueAccount: oracleQueueAccount,
    maxRows: 100,
  });
  if (crankAccount?.keypair) writeSecretKey("crank", crankAccount.keypair);
  console.log(chalkString("Crank Account", crankAccount.publicKey));

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
