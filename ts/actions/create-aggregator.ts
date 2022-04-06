import { Connection, PublicKey } from "@solana/web3.js";
import {
  loadSwitchboardProgram,
  OracleQueueAccount,
} from "@switchboard-xyz/switchboard-v2";
import chalk from "chalk";
import { RPC_URL } from "../config";
import {
  createAggregatorFromDefinition,
  loadAggregatorDefinition,
  saveAggregatorSchema,
} from "../schema";
import { CHECK_ICON, getKeypair } from "../utils";

export async function createPublicAggregator(argv: any): Promise<void> {
  const { definitionFile, queueKey, authorityKeypair, outFile, force } = argv;

  const program = await loadSwitchboardProgram(
    "devnet",
    new Connection(RPC_URL),
    getKeypair(authorityKeypair),
    {
      commitment: "finalized",
    }
  );

  const parsedAggregatorDefinition = loadAggregatorDefinition(definitionFile);
  if (!parsedAggregatorDefinition) {
    throw new Error(
      `failed to load aggregator definition from ${definitionFile}`
    );
  }
  if (parsedAggregatorDefinition.jobs.length === 0) {
    throw new Error(`no aggregator jobs defined`);
  }

  const queuePubkey = new PublicKey(queueKey);
  const queueAccount = new OracleQueueAccount({
    program,
    publicKey: queuePubkey,
  });

  console.log(chalk.yellow("######## Switchboard Setup ########"));
  const aggregatorSchema = await createAggregatorFromDefinition(
    program,
    parsedAggregatorDefinition,
    queueAccount
  );
  console.log(`${CHECK_ICON} Aggregator created succesfully `);
  saveAggregatorSchema(aggregatorSchema, outFile, force);
}
