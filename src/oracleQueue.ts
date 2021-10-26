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
import { loadAnchor, loadAnchorSync } from "./anchor";
import { getAuthorityKeypair } from "./accounts";
import {
  CrankSchema,
  OracleQueueDefinition,
  OracleSchemaDefinition,
  AggregatorSchema,
  OracleQueueSchema,
  keypair,
} from "./types";
import { Aggregator } from "./aggregator";
import { toAccountString } from "./utils";

export class OracleQueue {
  private program = loadAnchorSync();
  private authority = getAuthorityKeypair();
  public definition: OracleQueueDefinition;
  public programStateAccount?: ProgramStateAccount;
  public oracleQueueAccount?: OracleQueueAccount;
  public publisher?: PublicKey;
  public oracles?: OracleSchemaDefinition[];
  public cranks?: CrankSchema[];
  public feeds?: AggregatorSchema[];

  constructor(queueDefinition: OracleQueueDefinition) {
    this.definition = queueDefinition;
  }

  public async create(): Promise<OracleQueueSchema> {
    this.programStateAccount = await this.createProgramStateAccount();
    console.log(
      toAccountString(
        "program-state-account",
        this.programStateAccount.publicKey
      )
    );
    this.publisher = await this.createTokenMint(this.programStateAccount);
    await this.transferTokens(this.programStateAccount, this.publisher, 10000);
    this.oracleQueueAccount = await this.createOracleQueueAccount();
    if (!this.oracleQueueAccount.keypair)
      throw new Error(`oracle-queue-account missing keypair`);
    console.log(
      toAccountString("oracle-queue-account", this.oracleQueueAccount.publicKey)
    );
    this.oracles = await this.createOracles();
    this.cranks = await this.createCranks();
    this.feeds = await this.createFeeds();
    return {
      ...this.definition,
      keypair: new keypair(this.oracleQueueAccount.keypair),
      programStateAccount: this.programStateAccount.publicKey,
      oracles: this.oracles,
      cranks: this.cranks,
      feeds: this.feeds,
    };
  }

  private async createProgramStateAccount(): Promise<ProgramStateAccount> {
    let programAccount: ProgramStateAccount;
    let _bump;
    try {
      programAccount = await ProgramStateAccount.create(this.program, {});
    } catch (e) {
      [programAccount, _bump] = ProgramStateAccount.fromSeed(this.program);
    }
    this.programStateAccount = programAccount;
    return programAccount;
  }
  public async getPublisher(): Promise<PublicKey> {
    if (this.publisher) return this.publisher;
    const programState = this.programStateAccount
      ? this.programStateAccount
      : await this.createProgramStateAccount();
    return await this.createTokenMint(programState);
  }
  private async createTokenMint(
    programStateAccount: ProgramStateAccount
  ): Promise<PublicKey> {
    const switchTokenMint = await programStateAccount.getTokenMint();
    const publisher = await switchTokenMint.createAccount(
      this.program.provider.wallet.publicKey
    );
    return publisher;
  }
  private async transferTokens(
    programStateAccount: ProgramStateAccount,
    publisher: PublicKey,
    amount: number
  ) {
    await programStateAccount.vaultTransfer(publisher, this.authority, {
      amount: new anchor.BN(amount),
    });
  }
  public async getOracleQueueAccount(): Promise<OracleQueueAccount> {
    if (this.oracleQueueAccount) return this.oracleQueueAccount;
    return await this.createOracleQueueAccount();
  }
  private async createOracleQueueAccount(): Promise<OracleQueueAccount> {
    return OracleQueueAccount.create(this.program, {
      name: Buffer.from("q1"),
      metadata: Buffer.from(""),
      slashingEnabled: false,
      reward: new anchor.BN(0),
      minStake: new anchor.BN(this.definition.minStake),
      authority: this.authority.publicKey,
    });
  }
  private async createOracles(): Promise<OracleSchemaDefinition[]> {
    const oracleAccounts: OracleSchemaDefinition[] = [];
    if (this.definition.oracles.length === 0) return oracleAccounts;
    const queueAccount = this.oracleQueueAccount
      ? this.oracleQueueAccount
      : await this.createOracleQueueAccount();

    for await (const o of this.definition.oracles) {
      const oracleAccount = await OracleAccount.create(this.program, {
        name: Buffer.from(o.name),
        queueAccount,
      });
      console.log(toAccountString(o.name, oracleAccount.publicKey));
      const permissionAccount = await PermissionAccount.create(this.program, {
        authority: this.authority.publicKey,
        granter: queueAccount.publicKey,
        grantee: oracleAccount.publicKey,
      });
      await permissionAccount.set({
        authority: this.authority,
        permission: SwitchboardPermission.PERMIT_ORACLE_HEARTBEAT,
        enable: true,
      });
      oracleAccounts.push({
        ...o,
        publicKey: oracleAccount.publicKey,
        queuePermissionAccount: permissionAccount.publicKey,
      });
      console.log(
        toAccountString(`${o.name}-permission`, oracleAccount.publicKey)
      );
    }
    return oracleAccounts;
  }

  private async createCranks(): Promise<CrankSchema[]> {
    const crankAccounts: CrankSchema[] = [];
    if (!this.definition.cranks || this.definition.cranks.length === 0)
      return crankAccounts;
    const queueAccount = this.oracleQueueAccount
      ? this.oracleQueueAccount
      : await this.createOracleQueueAccount();

    for await (const o of this.definition.cranks) {
      const crankAccount = await CrankAccount.create(this.program, {
        name: Buffer.from(o.name),
        metadata: Buffer.from(""),
        queueAccount,
        maxRows: o.maxRows,
      });
      if (!crankAccount.keypair) throw new Error(`${o.name} missing keypair`);
      crankAccounts.push({
        ...o,
        keypair: new keypair(crankAccount.keypair),
        publicKey: crankAccount.publicKey,
      });
      console.log(toAccountString(`${o.name}`, crankAccount.publicKey));
    }
    return crankAccounts;
  }

  private async createFeeds(): Promise<AggregatorSchema[]> {
    const aggregators: AggregatorSchema[] = [];
    for await (const f of this.definition.feeds) {
      const aggregator = new Aggregator(
        this.program,
        this.authority,
        await this.getPublisher(),
        await this.getOracleQueueAccount(),
        f
      );
      aggregators.push(await aggregator.create());
      console.log(toAccountString(`${f.name}`, aggregator.account?.publicKey));
    }
    return aggregators;
  }
}
