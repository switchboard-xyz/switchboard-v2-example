import * as anchor from "@project-serum/anchor";
import { Connection } from "@solana/web3.js";
import fs from "fs";
import { ConfigError, RPC_URL, AnchorConfig } from "./types";
import { getAuthorityKeypair } from "./accounts";
import chalk from "chalk";
/**
 * Setup
 */
export async function loadAnchor(): Promise<anchor.Program> {
  if (!process.env.PID) {
    throw new ConfigError("failed to provide PID environment variable");
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
      throw new ConfigError(`no local anchor idl file found: ${localIdlFile}`);
    anchorIdl = JSON.parse(
      fs.readFileSync("switchboard_v2.json", "utf8")
    ) as anchor.Idl;
    if (!anchorIdl) {
      throw new ConfigError(`failed to read idl for ${programId}`);
    }
  }
  const program = new anchor.Program(anchorIdl, programId, provider);

  return program;
}
