import { Connection, PublicKey } from "@solana/web3.js";
import {
  AggregatorAccount,
  loadSwitchboardProgram,
  OracleQueueAccount,
  ProgramStateAccount,
  programWallet,
} from "@switchboard-xyz/switchboard-v2";
import chalk from "chalk";
import { RPC_URL } from "../config";
import { CHECK_ICON, getKeypair, watchTransaction } from "../utils";

export async function updateAggregator(argv: any): Promise<void> {
  const { authorityKeypair, aggregatorKey } = argv;

  const program = await loadSwitchboardProgram(
    "devnet",
    new Connection(RPC_URL),
    getKeypair(authorityKeypair),
    {
      commitment: "finalized",
    }
  );

  const [programStateAccount] = ProgramStateAccount.fromSeed(program);
  const switchTokenMint = await programStateAccount.getTokenMint();
  const tokenAccount = await switchTokenMint.createAccount(
    programWallet(program).publicKey
  );

  const aggregatorAccount = new AggregatorAccount({
    program,
    publicKey: new PublicKey(aggregatorKey),
  });
  if (!aggregatorAccount.publicKey) {
    throw new Error(`failed to read aggregator account ${aggregatorKey}`);
  }

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
