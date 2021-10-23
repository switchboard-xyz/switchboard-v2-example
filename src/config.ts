import * as anchor from "@project-serum/anchor";
import { Connection, Keypair } from "@solana/web3.js";
import resolve from "resolve-dir";
import fs from "fs";
import yargs from "yargs/yargs";
import { RPC_URL } from "./const";
import { ConfigError } from "./types";

export interface AppConfig {
  connection: Connection;
  wallet: anchor.Wallet;
  provider: anchor.Provider;
  idl: anchor.Idl;
  program: anchor.Program;
}

/**
 * Setup
 */
export async function getConfig(): Promise<AppConfig> {
  // Read in keypair file to fund the new feeds
  const argv = yargs(process.argv.slice(2))
    .options({
      updateAuthorityKeypair: {
        type: "string",
        describe: "Path to keypair file that will pay for transactions.",
        demand: true, // should output console command to create keypair
      },
    })
    .parseSync();

  if (!process.env.PID) {
    throw new ConfigError("failed to provide PID");
  }
  const connection = new Connection(RPC_URL, { commitment: "confirmed" });
  const programId = new anchor.web3.PublicKey(process.env.PID);

  // get update authority wallet
  const updateAuthorityBuffer = new Uint8Array(
    JSON.parse(fs.readFileSync(resolve(argv.updateAuthorityKeypair), "utf-8"))
  );
  const updateAuthority = Keypair.fromSecretKey(updateAuthorityBuffer);
  const wallet = new anchor.Wallet(updateAuthority);

  // get provider
  const provider = new anchor.Provider(connection, wallet, {
    commitment: "processed",
    preflightCommitment: "processed",
  });

  // get idl
  let anchorIdl = await anchor.Program.fetchIdl(programId, provider);
  if (anchorIdl === null) {
    console.log("reading idl from local storage");
    anchorIdl = JSON.parse(
      fs.readFileSync("switchboard_v2.json", "utf8")
    ) as anchor.Idl;
    if (!anchorIdl) {
      throw new ConfigError(`failed to get idl for ${programId}`);
    }
  }
  const program = new anchor.Program(anchorIdl, programId, provider);

  return {
    connection,
    wallet,
    provider,
    idl: anchorIdl,
    program,
  };
}
