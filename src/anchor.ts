import * as anchor from "@project-serum/anchor";
import { Connection } from "@solana/web3.js";
import fs from "fs";
import { RPC_URL } from "./main";
import { getAuthorityKeypair } from "./accounts";

/**
 * Attempts to load Anchor IDL on-chain and falls back to local JSON if not found
 */
export async function loadAnchor(): Promise<anchor.Program> {
  if (!process.env.PID) {
    throw new Error("failed to provide PID environment variable");
  }
  const connection = new Connection(RPC_URL, { commitment: "confirmed" });
  const programId = new anchor.web3.PublicKey(process.env.PID);

  // get update authority wallet
  const updateAuthority = getAuthorityKeypair();
  const wallet = new anchor.Wallet(updateAuthority);

  // get provider
  const provider = new anchor.Provider(connection, wallet, {
    commitment: "processed",
    preflightCommitment: "processed",
  });

  // get idl
  let anchorIdl = await anchor.Program.fetchIdl(programId, provider);
  if (anchorIdl === null) {
    const localIdlFile = "switchboard_v2.json";
    if (!fs.existsSync(localIdlFile))
      throw new Error(`no local anchor idl file found: ${localIdlFile}`);
    anchorIdl = JSON.parse(
      fs.readFileSync("switchboard_v2.json", "utf8")
    ) as anchor.Idl;
    if (!anchorIdl) {
      throw new Error(`failed to read idl for ${programId}`);
    }
  }
  const program = new anchor.Program(anchorIdl, programId, provider);

  return program;
}

/**
 * Loads anchor IDL from local JSON
 */
export function loadAnchorSync(): anchor.Program {
  if (!process.env.PID) {
    throw new Error("failed to provide PID environment variable");
  }
  const connection = new Connection(RPC_URL, { commitment: "confirmed" });
  const programId = new anchor.web3.PublicKey(process.env.PID);

  // get update authority wallet
  const updateAuthority = getAuthorityKeypair();
  const wallet = new anchor.Wallet(updateAuthority);

  // get provider
  const provider = new anchor.Provider(connection, wallet, {
    commitment: "processed",
    preflightCommitment: "processed",
  });
  const localIdlFile = "switchboard_v2.json";
  if (!fs.existsSync(localIdlFile))
    throw new Error(`no local anchor idl file found: ${localIdlFile}`);
  const anchorIdl = JSON.parse(
    fs.readFileSync("switchboard_v2.json", "utf8")
  ) as anchor.Idl;
  const program = new anchor.Program(anchorIdl, programId, provider);

  return program;
}
