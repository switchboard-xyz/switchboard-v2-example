import * as anchor from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import { CrankAccount } from "@switchboard-xyz/switchboard-v2";
import chalk from "chalk";
import {
  CHECK_ICON,
  loadAggregatorDefinition,
  loadAnchor,
  loadKeypair,
} from "../../utils";

export async function createAggregator(argv: any): Promise<void> {
  const { aggregatorDefinition, crankKey, authorityKeypair } = argv;
  console.log(aggregatorDefinition, crankKey, authorityKeypair);
  const authority = loadKeypair(authorityKeypair);
  if (!authority)
    throw new Error(
      `failed to load authority keypair from ${authorityKeypair}`
    );

  const program: anchor.Program = await loadAnchor(authority);
  const crankPubkey = new PublicKey(crankKey);
  const crankAccount = new CrankAccount({ program, publicKey: crankPubkey });

  const parsedAggregatorDefinition =
    loadAggregatorDefinition(aggregatorDefinition);
  if (!parsedAggregatorDefinition)
    throw new Error(`failed to load aggregator definition`);
  if (parsedAggregatorDefinition.jobs.length === 0)
    throw new Error(`no aggregator jobs defined`);

  console.log(chalk.yellow("######## Switchboard Setup ########"));

  console.log(
    `${CHECK_ICON} Aggregator created succesfully and added to crank`
  );
}
