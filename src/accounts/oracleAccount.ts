import * as anchor from "@project-serum/anchor";
import { Keypair, PublicKey } from "@solana/web3.js";
import {
  OracleAccount,
  OracleQueueAccount,
  PermissionAccount,
  SwitchboardPermission,
} from "@switchboard-xyz/switchboard-v2";
import { Expose, Transform, Exclude, Type } from "class-transformer";
import { AnchorProgram } from "../program";
import TransformPublicKey from "../types/transformPublicKey";
import { toAccountString } from "../utils";

export class OracleDefiniton {
  @Exclude()
  private _program: anchor.Program = AnchorProgram.getInstance().program;
  @Expose()
  public name!: string;

  public async toSchema(
    oracleQueueAccount: OracleQueueAccount,
    authority: Keypair
  ): Promise<OracleSchema> {
    const oracleAccount = await OracleAccount.create(this._program, {
      name: Buffer.from(this.name),
      queueAccount: oracleQueueAccount,
    });
    console.log(toAccountString(this.name, oracleQueueAccount));
    const permissionAccount = await PermissionAccount.create(this._program, {
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
      publicKey: oracleAccount.publicKey.toString(),
      queuePermissionAccount: permissionAccount.publicKey.toString(),
    };
  }
}

export class OracleSchema extends OracleDefiniton {
  @Expose()
  public publicKey!: string;
  @Expose()
  public queuePermissionAccount!: string;
}
export {};
