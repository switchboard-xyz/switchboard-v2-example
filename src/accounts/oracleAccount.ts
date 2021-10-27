import * as anchor from "@project-serum/anchor";
import { Keypair, PublicKey } from "@solana/web3.js";
import {
  OracleAccount,
  OracleQueueAccount,
  PermissionAccount,
  SwitchboardPermission,
} from "@switchboard-xyz/switchboard-v2";
import { jsonObject, jsonMember, toJson } from "typedjson";
import { AnchorProgram } from "../program";
import { toAccountString } from "../utils";

@jsonObject
export class OracleDefiniton {
  @jsonMember
  public name!: string;
  program: anchor.Program = AnchorProgram.getInstance().program;

  public async toSchema(
    oracleQueueAccount: OracleQueueAccount,
    authority: Keypair
  ): Promise<OracleSchema> {
    const oracleAccount = await OracleAccount.create(this.program, {
      name: Buffer.from(this.name),
      queueAccount: oracleQueueAccount,
    });
    console.log(toAccountString(this.name, oracleQueueAccount));
    const permissionAccount = await PermissionAccount.create(this.program, {
      authority: authority.publicKey,
      granter: oracleQueueAccount.publicKey,
      grantee: oracleAccount.publicKey,
    });
    await permissionAccount.set({
      authority: authority,
      permission: SwitchboardPermission.PERMIT_ORACLE_HEARTBEAT,
      enable: true,
    });
    console.log(toAccountString(`${this.name}-permission`, oracleAccount));
    return {
      ...this,
      publicKey: oracleAccount.publicKey,
      queuePermissionAccount: permissionAccount.publicKey,
    };
  }
}

@toJson({ overwrite: true })
@jsonObject
export class OracleSchema extends OracleDefiniton {
  @jsonMember
  public publicKey!: PublicKey;
  @jsonMember
  public queuePermissionAccount!: PublicKey;
}
export {};
