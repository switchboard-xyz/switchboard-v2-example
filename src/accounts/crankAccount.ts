import * as anchor from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import {
  CrankAccount,
  OracleQueueAccount,
} from "@switchboard-xyz/switchboard-v2";
import { jsonObject, jsonMember, toJson } from "typedjson";
import { toAccountString } from "../utils";
import { AnchorProgram } from "../program";

@jsonObject
export class CrankDefinition {
  @jsonMember
  public name!: string;
  @jsonMember
  public maxRows!: number;
  program: anchor.Program = AnchorProgram.getInstance().program;
  public async toSchema(
    oracleQueueAccount: OracleQueueAccount
  ): Promise<CrankSchema> {
    const crankAccount = await CrankAccount.create(this.program, {
      name: Buffer.from(this.name),
      metadata: Buffer.from(""),
      queueAccount: oracleQueueAccount,
      maxRows: this.maxRows,
    });
    if (!crankAccount.keypair) throw new Error(`${this.name} missing keypair`);
    console.log(toAccountString(`${this.name}`, crankAccount));

    return {
      ...this,
      secretKey: crankAccount.keypair.secretKey,
      publicKey: crankAccount.keypair.publicKey,
    };
  }
}

@toJson({ overwrite: true })
@jsonObject
export class CrankSchema extends CrankDefinition {
  @jsonMember
  public secretKey!: Uint8Array;
  @jsonMember
  public publicKey!: PublicKey;
}
export {};
