import * as anchor from "@project-serum/anchor";
import { Connection, Keypair } from "@solana/web3.js";
import fs from "fs";
import { findProjectRoot, RPC_URL } from ".";

export const loadAnchorProgram = (authority: Keypair): anchor.Program => {
  const keypairFile =
    findProjectRoot() +
    "rust/on-chain-feed-parser/target/deploy/on_chain_feed_parser-keypair.json";
  if (!fs.existsSync(keypairFile))
    throw new Error(`Could not find keypair at ${keypairFile}`);
  const keypairString = fs.readFileSync(keypairFile, "utf8");
  const keypairBuffer = new Uint8Array(JSON.parse(keypairString));
  const walletKeypair = Keypair.fromSecretKey(keypairBuffer);

  const connection = new Connection(RPC_URL, { commitment: "confirmed" });
  const programId = new anchor.web3.PublicKey(walletKeypair.publicKey);
  const wallet = new anchor.Wallet(authority);
  const provider = new anchor.Provider(connection, wallet, {
    commitment: "processed",
    preflightCommitment: "processed",
  });
  const idlFile =
    findProjectRoot() +
    "rust/anchor-feed-parser/target/idl/anchor_feed_parser.json";

  if (!fs.existsSync(idlFile))
    throw new Error(`Could not find anchor idl at ${idlFile}`);
  const anchorIdl: anchor.Idl = JSON.parse(fs.readFileSync(idlFile, "utf8"));
  if (!anchorIdl) {
    throw new Error(`failed to read idl for ${programId}`);
  }

  const program = new anchor.Program(anchorIdl, programId, provider);

  return program;
};
