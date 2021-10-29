import * as anchor from "@project-serum/anchor";
import { Connection, Keypair } from "@solana/web3.js";
import fs from "node:fs";
import { PROGRAM_ID, RPC_URL } from ".";
import { loadAuthorityKeypair } from "../utils";

/**
 * Async singleton to load anchor IDL and authority keypair
 */
export class AnchorProgram {
  private static _instance: AnchorProgram;

  authority: Keypair = loadAuthorityKeypair();

  program: Promise<anchor.Program> = loadAnchor(this.authority);

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  static getInstance(): AnchorProgram {
    if (this._instance) {
      return this._instance;
    }

    this._instance = new AnchorProgram();
    return this._instance;
  }
}

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
  if (!PROGRAM_ID) {
    console.log(PROGRAM_ID);
    throw new Error("failed to provide PID environment variable");
  }
  const connection = new Connection(RPC_URL, { commitment: "confirmed" });
  const programId = new anchor.web3.PublicKey(PROGRAM_ID);

  // get update authority wallet
  const updateAuthority = loadAuthorityKeypair();
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
