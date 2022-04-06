import * as anchor from "@project-serum/anchor";
import { Connection } from "@solana/web3.js";
import {
  CrankAccount,
  getPayer,
  loadSwitchboardProgram,
  OracleAccount,
  OracleQueueAccount,
  PermissionAccount,
  ProgramStateAccount,
  SwitchboardPermission,
} from "@switchboard-xyz/switchboard-v2";
import chalk from "chalk";
import { RPC_URL } from "../config";
import {
  loadQueueDefinition,
  loadQueueSchema,
  QueueSchema,
  saveQueueSchema,
} from "../schema";
import {
  CHECK_ICON,
  getKeypair,
  sleep,
  toAccountString,
  toPermissionString,
  toUtf8,
} from "../utils";

export async function createPersonalQueue(argv: any): Promise<void> {
  const { queueDefinition, authorityKeypair, outFile, force } = argv;

  const program = await loadSwitchboardProgram(
    "devnet",
    new Connection(RPC_URL),
    getKeypair(authorityKeypair),
    {
      commitment: "finalized",
    }
  );
  const authority = getPayer(program);

  const schema = loadQueueSchema(outFile);
  if (schema && !force) {
    console.log(
      `Oracle Queue Schema: already initialized at ${chalk.green(outFile)}`
    );
    return;
  }

  const definition = loadQueueDefinition(queueDefinition);
  if (!definition) {
    throw new Error(`failed to load queue definition`);
  }

  console.log(chalk.yellow("######## Switchboard Setup ########"));

  // Program State Account and token mint for payout rewards
  const [programStateAccount] = ProgramStateAccount.fromSeed(program);
  console.log(toAccountString("Program State", programStateAccount.publicKey));

  // Oracle Queue
  const qName = definition.name ?? "Queue-1";
  const queueAccount = await OracleQueueAccount.create(program, {
    name: Buffer.from(qName),
    slashingEnabled: false,
    reward: definition.reward
      ? new anchor.BN(definition.reward)
      : new anchor.BN(0), // no token account needed
    minStake: definition.minStake
      ? new anchor.BN(definition.minStake)
      : new anchor.BN(0),
    authority: authority.publicKey,
  });
  console.log(toAccountString(qName, queueAccount.publicKey));

  // create schema
  await sleep(1000); // give RPC time
  const queueData = await queueAccount.loadData();
  const queueSchema: QueueSchema = {
    queue: {
      name: toUtf8(queueData.name),
      authority: queueData.authority,
      secretKey: authority.secretKey,
      publicKey: queueAccount.publicKey,
    },
    cranks: [],
    oracles: [],
  };

  // Crank
  if (!definition.cranks || definition.cranks.length === 0)
    definition.cranks = [{ name: "Crank-1", maxRows: 10 }]; // add default crank if empty

  const crankAccounts: CrankAccount[] = [];
  for (const crank of definition.cranks) {
    const crankAccount = await CrankAccount.create(program, {
      name: Buffer.from(crank.name),
      metadata: crank.metadata ? Buffer.from(crank.metadata) : Buffer.from(""),
      maxRows: crank.maxRows ?? 10,
      queueAccount,
    });
    console.log(toAccountString(crank.name, crankAccount.publicKey));
    crankAccounts.push(crankAccount);

    // add to schema
    await sleep(1000); // give RPC time
    const crankData = await crankAccount.loadData();
    queueSchema.cranks.push({
      name: toUtf8(crankData.name),
      publicKey: crankAccount.publicKey,
      pqSize: crankData.pqSize,
      maxRows: crankData.maxRows,
      aggregators: [],
    });
  }

  // Oracle
  if (!definition.oracles || definition.oracles.length === 0)
    definition.oracles = [{ name: "Oracle-1" }]; // add default oracle if empty

  const oracleAccounts: OracleAccount[] = [];
  for (const oracle of definition.oracles) {
    const oracleAccount = await OracleAccount.create(program, {
      name: Buffer.from(oracle.name),
      queueAccount,
    });
    console.log(toAccountString(oracle.name, oracleAccount.publicKey));
    oracleAccounts.push(oracleAccount);

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

    // add to schema
    const oracleData = await oracleAccount.loadData();
    const permissionData = await oraclePermission.loadData();
    // console.log(JSON.stringify(permissionData, undefined, 2));
    queueSchema.oracles.push({
      name: toUtf8(oracleData.name),
      publicKey: oracleAccount.publicKey,
      tokenAccount: oracleData.tokenAccount,
      permission: {
        publicKey: oraclePermission.publicKey,
        queuePermission: toPermissionString(permissionData.permissions),
        granter: permissionData.granter,
        grantee: permissionData.grantee,
      },
    });
  }

  saveQueueSchema(queueSchema, outFile, force);
  console.log(
    `${CHECK_ICON} Oracle succesfully initiated with a crank and oracle`
  );
}
