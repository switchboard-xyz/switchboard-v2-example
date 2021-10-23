import * as anchor from "@project-serum/anchor";
import { Connection, Keypair } from "@solana/web3.js";
import resolve from "resolve-dir";
import fs from "fs";
import yargs from "yargs/yargs";
import { ConfigError, RPC_URL, AnchorConfig } from "../types";
import { getAuthorityKeypair } from "../accounts/authority/authorityKeypair";

/**
 * Setup
 */
export async function loadAnchor(): Promise<AnchorConfig> {
  // Read in keypair file to fund the new feeds
  const argv = yargs(process.argv.slice(2))
    .options({
      updateAuthorityKeypair: {
        type: "string",
        describe: "Path to keypair file that will pay for transactions.",
        demand: false, // should output console command to create keypair
      },
    })
    .parseSync();

  if (!process.env.PID) {
    throw new ConfigError("failed to provide PID");
  }
  const connection = new Connection(RPC_URL, { commitment: "confirmed" });
  const programId = new anchor.web3.PublicKey(process.env.PID);

  // get update authority wallet
  let updateAuthority = getAuthorityKeypair();
  if (argv.updateAuthorityKeypair) {
    const updateAuthorityBuffer = new Uint8Array(
      JSON.parse(fs.readFileSync(resolve(argv.updateAuthorityKeypair), "utf-8"))
    );
    updateAuthority = Keypair.fromSecretKey(updateAuthorityBuffer);
  }
  if (!updateAuthority) throw new ConfigError("no update authority provided");

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
    authority: wallet,
    provider,
    idl: anchorIdl,
    program,
  };
}
