import * as anchor from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import {
  CrankAccount,
  OracleQueueAccount,
} from "@switchboard-xyz/switchboard-v2";
import chalk from "chalk";
import {
  createAggregatorFromDefinition,
  loadAggregatorDefinition,
  saveAggregatorSchema,
} from "../../schema";
import { CHECK_ICON, loadAnchor, loadKeypair } from "../../utils";

export async function createPublicAggregator(argv: any): Promise<void> {
  const { definitionFile, crankKey, authorityKeypair, outFile } = argv;
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
  const crankPubkey = new PublicKey(crankKey);
  const crankAccount = new CrankAccount({ program, publicKey: crankPubkey });
  const crankData = await crankAccount.loadData();
  const queueAccount = new OracleQueueAccount({
    program,
    publicKey: crankData.queuePubkey,
  });

  console.log(chalk.yellow("######## Switchboard Setup ########"));
  const aggregatorSchema = await createAggregatorFromDefinition(
    program,
    parsedAggregatorDefinition,
    queueAccount
  );
  console.log(`${CHECK_ICON} Aggregator created succesfully `);
  saveAggregatorSchema(aggregatorSchema, outFile);
}
