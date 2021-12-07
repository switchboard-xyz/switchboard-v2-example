import * as anchor from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import { OracleJob } from "@switchboard-xyz/switchboard-api";
import {
  AggregatorAccount,
  JobAccount,
  LeaseAccount,
  PermissionAccount,
  ProgramStateAccount,
  SwitchboardPermission,
} from "@switchboard-xyz/switchboard-v2";
import chalk from "chalk";
import {
  AggregatorSchema,
  JobSchema,
  loadQueueSchema,
  parseQueueSchema,
  QueueSchema,
  saveQueueSchema,
} from "../../schema";
import {
  CHECK_ICON,
  FAILED_ICON,
  loadAggregatorDefinition,
  loadAnchor,
  toAccountString,
  toPermissionString,
  toUtf8,
} from "../../utils";

async function main(): Promise<void> {
  const queueSchema = loadQueueSchema();
  if (!queueSchema) {
    console.log(
      `${FAILED_ICON} Oracle Queue Schema: has not been initialized. Run the following command to get started\r\n\t${chalk.yellow(
        "ts-node ts/actions/queue-init"
      )}`
    );
    return;
  }

  const program: anchor.Program = await loadAnchor();
  const queue = parseQueueSchema(program, queueSchema);

  const aggregatorDefinition = loadAggregatorDefinition();
  if (!aggregatorDefinition)
    throw new Error(`failed to load aggregator definition`);
  if (aggregatorDefinition.jobs.length === 0)
    throw new Error(`no aggregator jobs defined`);

  console.log(chalk.yellow("######## Switchboard Setup ########"));

  // Aggregator
  const feedName = aggregatorDefinition.name || "BTC_USD";
  const aggregatorAccount = await AggregatorAccount.create(program, {
    name: Buffer.from(feedName),
    batchSize: aggregatorDefinition.batchSize || 1,
    minRequiredOracleResults:
      aggregatorDefinition.minRequiredOracleResults || 1,
    minRequiredJobResults: aggregatorDefinition.minRequiredJobResults || 1,
    minUpdateDelaySeconds: aggregatorDefinition.minUpdateDelaySeconds || 10,
    queueAccount: queue.account,
    authority: program.provider.wallet.publicKey,
  });
  console.log(
    toAccountString(`Aggregator (${feedName})`, aggregatorAccount.publicKey)
  );
  if (!aggregatorAccount.publicKey)
    throw new Error(`failed to read Aggregator publicKey`);

  // Aggregator Permissions
  const aggregatorPermission = await PermissionAccount.create(program, {
    authority: program.provider.wallet.publicKey,
    granter: new PublicKey(queue.account.publicKey),
    grantee: aggregatorAccount.publicKey,
  });
  await aggregatorPermission.set({
    authority: queue.authority,
    permission: SwitchboardPermission.PERMIT_ORACLE_QUEUE_USAGE,
    enable: true,
  });
  console.log(toAccountString(`  Permission`, aggregatorPermission.publicKey));

  // Lease
  const [programStateAccount] = ProgramStateAccount.fromSeed(program);
  const switchTokenMint = await programStateAccount.getTokenMint();
  const tokenAccount = await switchTokenMint.getOrCreateAssociatedAccountInfo(
    program.provider.wallet.publicKey
  );
  const leaseContract = await LeaseAccount.create(program, {
    loadAmount: new anchor.BN(0),
    funder: tokenAccount.address,
    funderAuthority: (program.provider.wallet as anchor.Wallet).payer,
    oracleQueueAccount: queue.account,
    aggregatorAccount,
  });
  console.log(toAccountString(`  Lease`, leaseContract.publicKey));

  // Jobs
  const jobs: JobSchema[] = [];
  for await (const job of aggregatorDefinition.jobs) {
    const { name, tasks } = job;
    const jobData = Buffer.from(
      OracleJob.encodeDelimited(
        OracleJob.create({
          tasks,
        })
      ).finish()
    );
    const jobKeypair = anchor.web3.Keypair.generate();
    const jobAccount = await JobAccount.create(program, {
      data: jobData,
      keypair: jobKeypair,
    });
    console.log(toAccountString(`  Job (${name})`, jobAccount.publicKey));
    await aggregatorAccount.addJob(
      jobAccount,
      (program.provider.wallet as anchor.Wallet).payer
    ); // Add Job to Aggregator
    const jobSchema: JobSchema = {
      name,
      publicKey: jobAccount.publicKey,
      secretKey: jobKeypair.secretKey,
      tasks,
    };
    jobs.push(jobSchema);
  }

  // Add Aggregator to Crank
  await queue.cranks[0].push({ aggregatorAccount });

  const aggregatorData = await aggregatorAccount.loadData();
  const permissionData = await aggregatorPermission.loadData();

  const newAggregatorDefinition: AggregatorSchema = {
    ...aggregatorDefinition,
    name: toUtf8(aggregatorData.name),
    batchSize: aggregatorData.batchSize,
    minRequiredOracleResults: aggregatorData.minRequiredOracleResults,
    minRequiredJobResults: aggregatorData.minRequiredJobResults,
    minUpdateDelaySeconds: aggregatorData.minUpdateDelaySeconds,
    permission: {
      publicKey: aggregatorPermission.publicKey,
      expiration: permissionData.expiration,
      queuePermission: toPermissionString(permissionData.permissions),
      granter: permissionData.granter,
      grantee: permissionData.grantee,
    },
    lease: {
      publicKey: leaseContract.publicKey,
    },
    jobs,
  };

  const cranks = queueSchema.cranks.map((c, index) => {
    const crankSchema = c;
    if (!index) crankSchema.aggregators.push(newAggregatorDefinition);
    return crankSchema;
  });

  const newQueueSchema: QueueSchema = {
    ...queueSchema,
    cranks,
  };
  saveQueueSchema(newQueueSchema);
  console.log(
    `${CHECK_ICON} Aggregator ${feedName} created succesfully and added to crank`
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
