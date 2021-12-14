import * as anchor from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import { OracleQueueAccount } from "@switchboard-xyz/switchboard-v2";
import chalk from "chalk";
import {
  createAggregatorFromDefinition,
  loadAggregatorDefinition,
  saveAggregatorSchema,
} from "../schema";
import { CHECK_ICON, loadAnchor, loadKeypair } from "../utils";

export async function createPublicAggregator(argv: any): Promise<void> {
  const { definitionFile, queueKey, authorityKeypair, outFile, force } = argv;
  const authority = loadKeypair(authorityKeypair);
  if (!authority)
    throw new Error(
      `failed to load authority keypair from ${authorityKeypair}`
    );
  const parsedAggregatorDefinition = loadAggregatorDefinition(definitionFile);
  if (!parsedAggregatorDefinition)
    throw new Error(
      `failed to load aggregator definition from ${definitionFile}`
    );
  if (parsedAggregatorDefinition.jobs.length === 0)
    throw new Error(`no aggregator jobs defined`);

  const program: anchor.Program = await loadAnchor(authority);
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
