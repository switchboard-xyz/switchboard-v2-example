/* eslint-disable unicorn/no-process-exit */
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
import { loadSchema } from "../../../src/schema";
import { RPC_URL } from "../../../src/types";
import { loadAuthorityKeypair } from "../../../src/utils";
dotenv.config();

const loadProgramKeypair = (): string => {
  const keypairFile =
    "rust/on-chain-feed-parser/target/deploy/on_chain_feed_parser-keypair.json";
  if (!fs.existsSync(keypairFile)) throw new Error(`Could not find keypair`);
  const keypairString = fs.readFileSync(keypairFile, "utf8");
  const keypairBuffer = new Uint8Array(JSON.parse(keypairString));
  const walletKeypair = Keypair.fromSecretKey(keypairBuffer);
  return walletKeypair.publicKey.toString();
};

async function main() {
  const authority = loadAuthorityKeypair();
  const PROGRAM_ID = loadProgramKeypair();
  if (!PROGRAM_ID)
    throw new Error(
      `failed to get program ID of on-chain-feed-parser. Provide it as an argument programId="PROGRAM_ID" or set ONCHAIN_PID in an env file `
    );
  console.log("On-Chain Feed Parser PID:", PROGRAM_ID);
  const schema = await loadSchema();
  const solPubkey = schema.findAggregatorByName("SOL_USD");
  if (!solPubkey)
    throw new Error(`failed to find SOL_USD aggregator in schema`);

  console.log("Data Feed:", solPubkey.toString());

  const connection = new Connection(RPC_URL, "processed");

  const transactionInstruction = new TransactionInstruction({
    keys: [
      {
        pubkey: solPubkey,
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
}

main().then(
  () => process.exit(),
  (error) => {
    console.error("Failed to complete action.");
    console.error(error);
    process.exit(-1);
  }
);
