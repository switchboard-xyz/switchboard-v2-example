import * as anchor from "@project-serum/anchor";
import { Keypair, PublicKey } from "@solana/web3.js";
import {
  OracleAccount,
  OracleQueueAccount,
  PermissionAccount,
  SwitchboardPermission,
} from "@switchboard-xyz/switchboard-v2";
import { Exclude, Expose, plainToClass } from "class-transformer";
import { AnchorProgram } from "../types";
import { toAccountString } from "../../utils";

export interface IOracleDefinition {
  name: string;
}

export interface IOracleSchema {
  publicKey: string;
  queuePermissionAccount: string;
}

export class OracleDefiniton implements IOracleDefinition {
  @Exclude()
  _program: Promise<anchor.Program> = AnchorProgram.getInstance().program;

  @Exclude()
  _authority: Keypair = AnchorProgram.getInstance().authority;

  @Expose()
  public name!: string;

  public async toSchema(
    oracleQueueAccount: OracleQueueAccount
  ): Promise<OracleSchema> {
    const program = await this._program;
    const oracleAccount = await OracleAccount.create(program, {
      name: Buffer.from(this.name),
      queueAccount: oracleQueueAccount,
    });
    console.log(toAccountString(this.name, oracleAccount));
    const permissionAccount = await PermissionAccount.create(program, {
      authority: this._authority.publicKey,
      granter: oracleQueueAccount.publicKey,
      grantee: oracleAccount.publicKey,
    });
    await permissionAccount.set({
      authority: this._authority,
      permission: SwitchboardPermission.PERMIT_ORACLE_HEARTBEAT,
      enable: true,
    });
    console.log(toAccountString(`     ${this.name}-permission`, oracleAccount));
    await oracleAccount.heartbeat();

    const oracleSchema: IOracleSchema = {
      ...this,
      publicKey: oracleAccount.publicKey.toString(),
      queuePermissionAccount: permissionAccount.publicKey.toString(),
    };
    return plainToClass(OracleSchema, oracleSchema);
  }
}

export class OracleSchema extends OracleDefiniton implements IOracleSchema {
  @Expose()
  public publicKey!: string;

  @Expose()
  public queuePermissionAccount!: string;

  public async toAccount(): Promise<OracleAccount> {
    const publicKey = new PublicKey(this.publicKey);
    if (!publicKey)
      throw new Error(`failed to load Oracle account ${this.publicKey}`);
    const oracleAccount = new OracleAccount({
      program: await this._program,
      publicKey,
    });
    return oracleAccount;
  }

  public async getPermissionAccount(): Promise<PermissionAccount> {
    const publicKey = new PublicKey(this.queuePermissionAccount);
    if (!publicKey)
      throw new Error(
        `failed to load Oracle permission account ${this.queuePermissionAccount}`
      );
    const permissionAccount = new PermissionAccount({
      program: await this._program,
      publicKey,
    });
    return permissionAccount;
  }

  public print(): void {
    console.log(toAccountString(this.name, this.publicKey.toString()));
  }
}
export {};
