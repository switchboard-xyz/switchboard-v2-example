import {
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import dotenv from "dotenv";
import fs from "node:fs";
import { hideBin } from "yargs/helpers";
import Yargs from "yargs/yargs";
import { RPC_URL } from "../types";
import { findProjectRoot, loadAuthorityKeypair } from "../utils";
dotenv.config();

const loadProgramId = (): string => {
  const keypairFile =
    findProjectRoot() +
    "rust/on-chain-feed-parser/target/deploy/on_chain_feed_parser-keypair.json";
  if (!fs.existsSync(keypairFile)) throw new Error(`Could not find keypair`);
  const keypairString = fs.readFileSync(keypairFile, "utf8");
  const keypairBuffer = new Uint8Array(JSON.parse(keypairString));
  const walletKeypair = Keypair.fromSecretKey(keypairBuffer);
  return walletKeypair.publicKey.toString();
};

async function testSimpleExample(dataFeedPubkey: PublicKey) {
  const authority = loadAuthorityKeypair();
  const PROGRAM_ID = loadProgramId();
  if (!PROGRAM_ID)
    throw new Error(`failed to get program ID of on-chain-feed-parser`);
  console.log("On-Chain Feed Parser PID:", PROGRAM_ID);

  const connection = new Connection(RPC_URL, "confirmed");
  const transactionInstruction = new TransactionInstruction({
    keys: [
      {
        pubkey: dataFeedPubkey,
        isSigner: false,
        isWritable: false,
      },
    ],
    programId: new PublicKey(PROGRAM_ID),
    data: Buffer.from([]),
  });

  console.log("Awaiting transaction confirmation...");
  const signature = await sendAndConfirmTransaction(
    connection,
    new Transaction().add(transactionInstruction),
    [authority]
  );
  console.log(`https://explorer.solana.com/tx/${signature}?cluster=devnet`);
  const confirmedTxn = await connection.getConfirmedTransaction(signature);
  console.log(JSON.stringify(confirmedTxn?.meta?.logMessages, undefined, 2));
}

async function main() {
  const argv = Yargs(hideBin(process.argv))
    .options({
      dataFeedPubkey: {
        type: "string",
        describe: "Data feed public key to read on-chain",
        demand: true,
      },
    })
    .parseSync();
  const dataFeedPubkey = new PublicKey(argv.dataFeedPubkey);
  await testSimpleExample(dataFeedPubkey);
}

main().then(
  () => {
    return;
  },
  (error) => {
    console.error("Failed to complete action.");
    console.error(error);
    return;
  }
);
