import { Connection, PublicKey } from "@solana/web3.js";
import * as sbv2 from "@switchboard-xyz/switchboard-v2";
import {
  CrankAccount,
  loadSwitchboardProgram,
  OracleQueueAccount,
  ProgramStateAccount,
} from "@switchboard-xyz/switchboard-v2";
import chalk from "chalk";
import { RPC_URL } from "../config";
import { CHECK_ICON, getKeypair, watchTransaction } from "../utils";

export async function crankTurn(argv: any): Promise<void> {
  const { authorityKeypair, crankKey } = argv;

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
    sbv2.programWallet(program).publicKey
  );

  const crankAccount = new CrankAccount({
    program,
    publicKey: new PublicKey(crankKey),
  });

  const crank = await crankAccount.loadData();
  const queueAccount = new OracleQueueAccount({
    program,
    publicKey: crank.queuePubkey,
  });
  const queue = await queueAccount.loadData();

  const tx = await crankAccount.pop({
    payoutWallet: tokenAccount,
    queuePubkey: queueAccount.publicKey,
    queueAuthority: queue.authority,
    nonce: 0,
    crank,
    queue,
    tokenMint: switchTokenMint.publicKey,
  });
  console.log(`${CHECK_ICON} ${chalk.green("crank turned succesfully")}`);
  watchTransaction(tx, program.provider.connection);
}
