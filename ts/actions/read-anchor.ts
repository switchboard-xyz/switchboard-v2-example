import * as anchor from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import { AggregatorAccount } from "@switchboard-xyz/switchboard-v2";
import chalk from "chalk";
import { loadAnchor } from "../config";
import { CHECK_ICON, loadKeypair, watchTransaction } from "../utils";
import { loadAnchorProgram } from "../utils/loadAnchorProgram";

export async function readAnchorResult(argv: any): Promise<void> {
  const { authorityKeypair, aggregatorKey } = argv;
  const authority = loadKeypair(authorityKeypair);
  if (!authority)
    throw new Error(`failed to load authority keypair to pay for transaction`);
  const program: anchor.Program = await loadAnchor(authority);
  const aggregatorAccount = new AggregatorAccount({
    program,
    publicKey: new PublicKey(aggregatorKey),
  });
  if (!aggregatorAccount.publicKey)
    throw new Error(`failed to read aggregator account ${aggregatorKey}`);

  const anchorProgram = loadAnchorProgram(authority);

  const tx = await anchorProgram.rpc.readResult(
    {},
    {
      accounts: {
        aggregator: aggregatorAccount.publicKey,
      },
    }
  );
  console.log(
    `${CHECK_ICON} ${chalk.green("anchor read result transaction sent")}`
  );
  watchTransaction(tx, program.provider.connection);
}
