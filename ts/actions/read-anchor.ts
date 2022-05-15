import { Connection, PublicKey } from "@solana/web3.js";
import {
  AggregatorAccount,
  loadSwitchboardProgram,
  programWallet,
} from "@switchboard-xyz/switchboard-v2";
import chalk from "chalk";
import { RPC_URL } from "../config";
import { CHECK_ICON, getKeypair, watchTransaction } from "../utils";
import { loadAnchorProgram } from "../utils/loadAnchorProgram";

export async function readAnchorResult(argv: any): Promise<void> {
  const { authorityKeypair, aggregatorKey } = argv;

  const program = await loadSwitchboardProgram(
    "devnet",
    new Connection(RPC_URL),
    getKeypair(authorityKeypair),
    {
      commitment: "finalized",
    }
  );
  const authority = programWallet(program);

  const aggregatorAccount = new AggregatorAccount({
    program,
    publicKey: new PublicKey(aggregatorKey),
  });
  if (!aggregatorAccount.publicKey) {
    throw new Error(`failed to read aggregator account ${aggregatorKey}`);
  }

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
