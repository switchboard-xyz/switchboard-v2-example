/* eslint-disable unicorn/no-process-exit */
import {
  Connection,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import chalk from "chalk";
import dotenv from "dotenv";
import readlineSync from "readline-sync";
import Yargs from "yargs/yargs";
import { RPC_URL } from "../../../src/types";
import { loadAuthorityKeypair } from "../../../src/utils";
dotenv.config();

const argv = Yargs(process.argv.slice(2))
  .options({
    dataFeedPubkey: {
      type: "string",
      describe: "Public key of the data feed to use.",
      demand: false,
    },
    programId: {
      type: "string",
      describe: "Public key of the deployed program",
      demand: false,
    },
  })
  .parseSync();

async function main() {
  const PROGRAM_ID = argv.programId ? argv.programId : process.env.ONCHAIN_PID;
  if (!PROGRAM_ID)
    throw new Error(
      `failed to get program ID of on-chain-feed-parser. Provide it as an argument programId="PROGRAM_ID" or set ONCHAIN_PID in an env file `
    );
  console.log("On-Chain Feed Parser PID:", PROGRAM_ID);
  let dataFeed: PublicKey;
  if (!argv.dataFeedPubkey) {
    const pubkey = readlineSync.question(
      chalk.blue("Enter the public key of the data feed to read:\r\n")
    );
    dataFeed = new PublicKey(pubkey);
  } else {
    dataFeed = new PublicKey(argv.dataFeedPubkey);
  }
  console.log("Data Feed:", dataFeed.toString());
  const authority = loadAuthorityKeypair();
  const connection = new Connection(RPC_URL, "processed");

  const transactionInstruction = new TransactionInstruction({
    keys: [
      {
        pubkey: dataFeed,
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
