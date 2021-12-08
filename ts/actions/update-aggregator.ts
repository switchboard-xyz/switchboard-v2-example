import * as anchor from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import {
  AggregatorAccount,
  OracleQueueAccount,
  ProgramStateAccount,
} from "@switchboard-xyz/switchboard-v2";
import chalk from "chalk";
import {
  CHECK_ICON,
  loadAnchor,
  loadKeypair,
  watchTransaction,
} from "../utils";

export async function updateAggregator(argv: any): Promise<void> {
  const { authorityKeypair, aggregatorKey } = argv;
  const authority = loadKeypair(authorityKeypair);
  if (!authority)
    throw new Error(`failed to load authority keypair to pay for transaction`);
  const program: anchor.Program = await loadAnchor(authority);

  const [programStateAccount] = ProgramStateAccount.fromSeed(program);
  const switchTokenMint = await programStateAccount.getTokenMint();
  const tokenAccount = await switchTokenMint.createAccount(
    program.provider.wallet.publicKey
  );

  const aggregatorAccount = new AggregatorAccount({
    program,
    publicKey: new PublicKey(aggregatorKey),
  });
  if (!aggregatorAccount.publicKey)
    throw new Error(`failed to read aggregator account ${aggregatorKey}`);

  const { queuePubkey } = await aggregatorAccount.loadData();
  const queueAccount = new OracleQueueAccount({
    program,
    publicKey: queuePubkey,
  });

  const tx = await aggregatorAccount.openRound({
    oracleQueueAccount: queueAccount,
    payoutWallet: tokenAccount,
  });
  console.log(
    `${CHECK_ICON} ${chalk.green("aggregator open round event sent")}`
  );
  watchTransaction(tx, program.provider.connection);
}
