import * as anchor from "@project-serum/anchor";
import { Connection } from "@solana/web3.js";

export interface AnchorConfig {
  connection: Connection;
  wallet: anchor.Wallet;
  provider: anchor.Provider;
  idl: anchor.Idl;
  program: anchor.Program;
}
