import * as anchor from "@project-serum/anchor";
import {
  CrankAccount,
  OracleAccount,
  OracleQueueAccount,
  PermissionAccount,
  ProgramStateAccount,
  SwitchboardPermission,
} from "@switchboard-xyz/switchboard-v2";
import chalk from "chalk";
import {
  loadQueueSchema,
  QueueSchema,
  QUEUE_SCHEMA_PATH,
  saveQueueSchema,
} from "../schema";
import {
  CHECK_ICON,
  loadAnchor,
  toAccountString,
  toPermissionString,
  toUtf8,
} from "../utils";

async function main(): Promise<void> {
  const schema = loadQueueSchema();
  if (schema) {
    console.log(
      `Oracle Queue Schema: already initialized at ${chalk.green(
        QUEUE_SCHEMA_PATH
      )}`
    );

    return;
  }
  const program: anchor.Program = await loadAnchor();
  const authority = (program.provider.wallet as anchor.Wallet).payer;
  console.log(chalk.yellow("######## Switchboard Setup ########"));

  // Program State Account and token mint for payout rewards
  const [programStateAccount] = ProgramStateAccount.fromSeed(program);
  console.log(toAccountString("Program State", programStateAccount.publicKey));

  // Oracle Queue
  const queueAccount = await OracleQueueAccount.create(program, {
    name: Buffer.from("Queue-1"),
    slashingEnabled: false,
    reward: new anchor.BN(0), // no token account needed
    minStake: new anchor.BN(0),
    authority: authority.publicKey,
  });
  console.log(toAccountString("Oracle Queue", queueAccount.publicKey));

  // Crank
  const crankAccount = await CrankAccount.create(program, {
    name: Buffer.from("Crank-1"),
    maxRows: 10,
    queueAccount,
  });
  console.log(toAccountString("Crank-1", crankAccount.publicKey));

  // Oracle
  const oracleAccount = await OracleAccount.create(program, {
    name: Buffer.from("Oracle-1"),
    queueAccount,
  });
  console.log(toAccountString("Oracle-1", oracleAccount.publicKey));
  const oraclePermission = await PermissionAccount.create(program, {
    authority: authority.publicKey,
    granter: queueAccount.publicKey,
    grantee: oracleAccount.publicKey,
  });
  await oraclePermission.set({
    authority: (program.provider.wallet as any).payer,
    permission: SwitchboardPermission.PERMIT_ORACLE_HEARTBEAT,
    enable: true,
  });
  console.log(toAccountString(`  Permission`, oraclePermission.publicKey));

  await oracleAccount.heartbeat();

  const queueData = await queueAccount.loadData();
  const crankData = await crankAccount.loadData();
  const oracleData = await oracleAccount.loadData();
  const permissionData = await oraclePermission.loadData();

  const queueSchema: QueueSchema = {
    queue: {
      name: toUtf8(queueData.name),
      authority: queueData.authority,
      secretKey: authority.secretKey,
      publicKey: queueAccount.publicKey,
    },
    cranks: [
      {
        name: toUtf8(crankData.name),
        publicKey: crankAccount.publicKey,
        pqSize: crankData.pqSize,
        maxRows: crankData.maxRows,
        aggregators: [],
      },
    ],
    oracles: [
      {
        name: toUtf8(oracleData.name),
        publicKey: oracleAccount.publicKey,
        tokenAccount: oracleData.tokenAccount,
        permission: {
          publicKey: oraclePermission.publicKey,
          queuePermission: toPermissionString(permissionData.permissions),
          granter: permissionData.granter,
          grantee: permissionData.grantee,
        },
      },
    ],
  };
  saveQueueSchema(queueSchema);
  console.log(
    `${CHECK_ICON} Oracle succesfully initiated with a crank and oracle`
  );
}
main().then(
  () => {
    return;
  },
  (error) => {
    console.error(error);
    return;
  }
);

export {};
