import * as anchor from "@project-serum/anchor";
import { Connection, Keypair } from "@solana/web3.js";
import { SBV2_DEVNET_PID } from "@switchboard-xyz/switchboard-v2";
import dotenv from "dotenv";
dotenv.config();

const DEFAULT_RPC = "https://api.devnet.solana.com";
export const RPC_URL = process.env.RPC_URL || DEFAULT_RPC;
if (RPC_URL === DEFAULT_RPC) console.log("Default RPC Server:", RPC_URL);
else console.log("RPC Server:", RPC_URL);

export const KEYPAIR_OUTPUT = process.env.KEYPAIR_OUTPUT
  ? `keypairs-${process.env.KEYPAIR_OUTPUT}` // use prefix for gitignore glob pattern
  : "keypairs"; // root

export const PROGRAM_ID = SBV2_DEVNET_PID;

/**
 * Attempts to load Anchor IDL on-chain and falls back to local JSON if not found
 */
export async function loadAnchor(authority: Keypair): Promise<anchor.Program> {
  if (!PROGRAM_ID) {
    throw new Error("failed to provide PID environment variable");
  }
  const connection = new Connection(RPC_URL, { commitment: "confirmed" });
  const programId = new anchor.web3.PublicKey(PROGRAM_ID);

  const wallet = new anchor.Wallet(authority);

  // get provider
  const provider = new anchor.Provider(connection, wallet, {
    commitment: "processed",
    preflightCommitment: "processed",
  });

  // get idl
  const anchorIdl = await anchor.Program.fetchIdl(programId, provider);
  if (!anchorIdl) {
    throw new Error(`failed to read idl for ${programId}`);
  }
  const program = new anchor.Program(anchorIdl, programId, provider);

  return program;
}
