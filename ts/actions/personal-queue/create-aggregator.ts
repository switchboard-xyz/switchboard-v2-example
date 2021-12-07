import * as anchor from "@project-serum/anchor";
import {
  AggregatorAccount,
  PermissionAccount,
  SwitchboardPermission,
} from "@switchboard-xyz/switchboard-v2";
import chalk from "chalk";
import {
  AGGREGATOR_DEFINITION_PATH,
  createAggregatorFromDefinition,
  loadAggregatorDefinition,
  loadQueueSchema,
  parseQueueSchema,
  QueueSchema,
  saveQueueSchema,
} from "../../schema";
import { CHECK_ICON, FAILED_ICON, loadAnchor, loadKeypair } from "../../utils";

export async function createPersonalAggregator(argv: any): Promise<void> {
  const { authorityKeypair, queueSchemaFile } = argv;
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

  const aggregatorDefinition = loadAggregatorDefinition(
    AGGREGATOR_DEFINITION_PATH
  );
  if (!aggregatorDefinition)
    throw new Error(`failed to load aggregator definition`);
  if (aggregatorDefinition.jobs.length === 0)
    throw new Error(`no aggregator jobs defined`);

  console.log(chalk.yellow("######## Switchboard Setup ########"));

  const aggregatorSchema = await createAggregatorFromDefinition(
    program,
    aggregatorDefinition,
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

  // Add Aggregator to Crank
  await queue.cranks[0].push({ aggregatorAccount });

  const cranks = queueSchema.cranks.map((c, index) => {
    const crankSchema = c;
    if (!index) crankSchema.aggregators.push(aggregatorSchema);
    return crankSchema;
  });

  const newQueueSchema: QueueSchema = {
    ...queueSchema,
    cranks,
  };
  saveQueueSchema(newQueueSchema, queueSchemaFile);
  console.log(
    `${CHECK_ICON} Aggregator created succesfully and added to crank`
  );
}
