/* eslint-disable unicorn/no-process-exit */
import { Keypair } from "@solana/web3.js";
import dotenv from "dotenv";
import fs from "fs";
import { findProjectRoot } from "../../../ts/utils";

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

async function main() {
  // const authority = loadKeypair("secrets/authority-keypair.json");
  // const PROGRAM_ID = loadProgramId();
  // if (!PROGRAM_ID)
  //   throw new Error(`failed to get program ID of on-chain-feed-parser`);
  // console.log("On-Chain Feed Parser PID:", PROGRAM_ID);
  // const schema = await loadSchema();
  // const solPubkey = schema.findAggregatorByName("SOL_USD");
  // if (!solPubkey)
  //   throw new Error(`failed to find SOL_USD aggregator in schema`);
  // console.log("Data Feed:", solPubkey.toString());
  // const connection = new Connection(RPC_URL, "confirmed");
  // const transactionInstruction = new TransactionInstruction({
  //   keys: [
  //     {
  //       pubkey: solPubkey,
  //       isSigner: false,
  //       isWritable: false,
  //     },
  //   ],
  //   programId: new PublicKey(PROGRAM_ID),
  //   data: Buffer.from([]),
  // });
  // console.log("Awaiting transaction confirmation...");
  // const signature = await sendAndConfirmTransaction(
  //   connection,
  //   new Transaction().add(transactionInstruction),
  //   [authority]
  // );
  // console.log(`https://explorer.solana.com/tx/${signature}?cluster=devnet`);
  // const confirmedTxn = await connection.getConfirmedTransaction(signature);
  // console.log(JSON.stringify(confirmedTxn?.meta?.logMessages, undefined, 2));
}

main().then(
  () => process.exit(),
  (error) => {
    console.error("Failed to complete action.");
    console.error(error);
    process.exit(-1);
  }
);
