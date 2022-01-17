import * as anchor from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import {
  CrankAccount,
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

export async function crankTurn(argv: any): Promise<void> {
  const { authorityKeypair, crankKey } = argv;
  const authorityWallet = loadKeypair(authorityKeypair);
  if (!authorityWallet)
    throw new Error(`failed to load authority keypair to pay for transaction`);
  const program: anchor.Program = await loadAnchor(authorityWallet);

  const [programStateAccount] = ProgramStateAccount.fromSeed(program);
  const switchTokenMint = await programStateAccount.getTokenMint();
  const tokenAccount = await switchTokenMint.createAccount(
    program.provider.wallet.publicKey
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
