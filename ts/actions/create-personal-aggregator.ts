import * as anchor from "@project-serum/anchor";
import {
  AggregatorAccount,
  CrankAccount,
  PermissionAccount,
  SwitchboardPermission,
  SwitchboardPermissionValue,
} from "@switchboard-xyz/switchboard-v2";
import chalk from "chalk";
import {
  createAggregatorFromDefinition,
  loadAggregatorDefinition,
  loadQueueSchema,
  parseQueueSchema,
  QueueSchema,
  saveQueueSchema,
} from "../schema";
import {
  CHECK_ICON,
  FAILED_ICON,
  loadAnchor,
  loadKeypair,
  toPermissionString,
} from "../utils";

export async function createPersonalAggregator(argv: any): Promise<void> {
  const {
    authorityKeypair,
    queueSchemaFile,
    crankName,
    aggregatorDefinition,
    force,
  } = argv;
  const authority = loadKeypair(authorityKeypair);
  if (!authority)
    throw new Error(
      `failed to load authority keypair from ${authorityKeypair}`
    );
  const queueSchema = loadQueueSchema(queueSchemaFile);
  if (!queueSchema) {
    console.log(
      `${FAILED_ICON} Oracle Queue Schema: has not been initialized. Run the following command to get started\r\n\t${chalk.yellow(
        "ts-node ts/actions/queue-init"
      )}`
    );
    return;
  }

  const program: anchor.Program = await loadAnchor(authority);
  const queue = parseQueueSchema(program, queueSchema);

  const definition = loadAggregatorDefinition(aggregatorDefinition);
  if (!definition) throw new Error(`failed to load aggregator definition`);
  if (definition.jobs.length === 0)
    throw new Error(`no aggregator jobs defined`);

  console.log(chalk.yellow("######## Switchboard Setup ########"));

  const aggregatorSchema = await createAggregatorFromDefinition(
    program,
    definition,
    queue.account
  );

  // now we need to set permissions
  const aggregatorAccount = new AggregatorAccount({
    program,
    publicKey: aggregatorSchema.publicKey,
  });
  const aggregatorPermission = new PermissionAccount({
    program,
    publicKey: aggregatorSchema.permission?.publicKey,
  });
  await aggregatorPermission.set({
    authority: queue.authority,
    permission: SwitchboardPermission.PERMIT_ORACLE_QUEUE_USAGE,
    enable: true,
  });
  if (aggregatorSchema.permission?.queuePermission)
    aggregatorSchema.permission.queuePermission = toPermissionString(
      SwitchboardPermissionValue.PERMIT_ORACLE_QUEUE_USAGE
    );

  // Add Aggregator to Crank
  let crankAccount: CrankAccount = queue.cranks[0];
  if (crankName) {
    const crank = queueSchema.cranks.find(
      (c) => c.name?.toLowerCase() === crankName.toLowerCase()
    );
    if (!crank)
      console.log(
        "failed to find crank, adding to first crank defined in the queue"
      );
    else {
      crankAccount = new CrankAccount({
        program,
        publicKey: crank.publicKey,
      });
    }
  }
  await crankAccount.push({ aggregatorAccount });

  const cranks = queueSchema.cranks.map((c, index) => {
    if (c.publicKey === crankAccount.publicKey) {
      c.aggregators.push(aggregatorSchema);
    }
    return c;
  });

  const newQueueSchema: QueueSchema = {
    ...queueSchema,
    cranks,
  };
  saveQueueSchema(newQueueSchema, queueSchemaFile, force);
  console.log(
    `${CHECK_ICON} Aggregator created succesfully and added to crank`
  );
}
