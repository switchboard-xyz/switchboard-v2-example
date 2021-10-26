import {
  OracleAccount,
  PermissionAccount,
  OracleQueueAccount,
  ProgramStateAccount,
  CrankAccount,
  SwitchboardPermission,
} from "@switchboard-xyz/switchboard-v2";
import * as anchor from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import { loadAnchorSync } from "./anchor";
import { getAuthorityKeypair } from "./accounts";
import { OracleSchemaDefinition } from "./types";
import { Aggregator } from "./aggregator";

export class OracleSchema implements OracleSchemaDefinition {
  private program = loadAnchorSync();
  private authority = getAuthorityKeypair();
  public name: string;
  //   public publicKey: PublicKey;

  constructor(schema: OracleSchemaDefinition) {
    this.name = schema.name;
    // this.publicKey = schema.publicKey;
  }
}
