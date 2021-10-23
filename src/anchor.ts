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
    console.log("Local:".padEnd(8, " "), chalk.blue("anchor-idl"));
    anchorIdl = JSON.parse(
      fs.readFileSync("switchboard_v2.json", "utf8")
    ) as anchor.Idl;
    if (!anchorIdl) {
      throw new ConfigError(`failed to get idl for ${programId}`);
    }
  } else {
    console.log("Anchor:".padEnd(8, " "), chalk.blue("anchor-idl"));
  }
  const program = new anchor.Program(anchorIdl, programId, provider);

  return program;
}
