import * as anchor from "@project-serum/anchor";
import { Keypair, PublicKey } from "@solana/web3.js";
import {
  OracleQueueAccount,
  ProgramStateAccount,
} from "@switchboard-xyz/switchboard-v2";
import {
  classToPlain,
  Exclude,
  Expose,
  plainToClass,
  Type,
} from "class-transformer";
import fs from "node:fs";
import { BTC_FEED, SOL_FEED, USDT_FEED } from "../dataDefinitions/feeds";
import { AnchorProgram, TransformAnchorBN } from "../types";
import { toAccountString } from "../utils";
import {
  AggregatorDefinition,
  AggregatorSchema,
  CrankDefinition,
  CrankSchema,
  OracleDefiniton,
  OracleSchema,
} from "./";

export class OracleQueueDefinition {
  @Exclude()
  _program: anchor.Program = AnchorProgram.getInstance().program;

  @Exclude()
  _authority = AnchorProgram.getInstance().authority;

  @Expose()
  public name!: string;

  @Expose()
  @TransformAnchorBN()
  @Type(() => anchor.BN)
  public reward!: anchor.BN;

  @Expose()
  @TransformAnchorBN()
  @Type(() => anchor.BN)
  public minStake!: anchor.BN;

  @Expose()
  @Type(() => OracleDefiniton)
  public oracles!: OracleDefiniton[];

  @Expose()
  @Type(() => CrankDefinition)
  public cranks!: CrankDefinition[];

  @Expose()
  @Type(() => AggregatorDefinition)
  public feeds?: AggregatorDefinition[];

  /**
   * Creates the neccesary oracle queue accounts based on the input definition
   * 1. Loads programStateAccount
   * 2. Funds publisher for adding new feeds
   * 3. Creates new OracleQueue account
   * 4. Creates new Oracles and adds them to the queue
   * 5. Creates new Cranks and adds them to the queue
   * 6. Creates new Aggregator accounts, with job definitions, and funds leaseContract
   * 7. Adds aggregators to cranks
   */
  public async toSchema(authority: Keypair): Promise<OracleQueueSchema> {
    const programStateAccount = await this.createProgramStateAccount();
    console.log(toAccountString("program-state-account", programStateAccount));

    const publisher = await this.createTokenMint(programStateAccount);
    await this.transferTokens(
      programStateAccount,
      authority,
      publisher,
      10_000
    );

    const oracleQueueAccount = await this.createOracleQueueAccount();
    if (!oracleQueueAccount.keypair)
      throw new Error(`oracle-queue-account missing keypair`);
    console.log(toAccountString("oracle-queue-account", oracleQueueAccount));

    const oracles = await this.createOracles(oracleQueueAccount, authority);
    const cranks = await this.createCranks(oracleQueueAccount);
    const feeds = await this.createDefaultFeeds(
      oracleQueueAccount,
      publisher,
      authority
    );

    return plainToClass(OracleQueueSchema, {
      ...this,
      secretKey: `[${oracleQueueAccount.keypair.secretKey}]`,
      publicKey: oracleQueueAccount.keypair.publicKey.toString(),
      programStateAccount: programStateAccount.publicKey.toString(),
      oracles,
      cranks,
      feeds,
    });
  }

  private async createProgramStateAccount(): Promise<ProgramStateAccount> {
    let programAccount: ProgramStateAccount;

    try {
      programAccount = await ProgramStateAccount.create(this._program, {});
    } catch {
      [programAccount] = ProgramStateAccount.fromSeed(this._program);
    }
    return programAccount;
  }

  public async createTokenMint(
    programStateAccount: ProgramStateAccount
  ): Promise<PublicKey> {
    const switchTokenMint = await programStateAccount.getTokenMint();
    const publisher = await switchTokenMint.createAccount(
      this._program.provider.wallet.publicKey
    );
    return publisher;
  }

  private async transferTokens(
    programStateAccount: ProgramStateAccount,
    authority: Keypair,
    publisher: PublicKey,
    amount: number
  ) {
    await programStateAccount.vaultTransfer(publisher, authority, {
      amount: new anchor.BN(amount),
    });
  }

  private async createOracleQueueAccount(): Promise<OracleQueueAccount> {
    return OracleQueueAccount.create(this._program, {
      name: Buffer.from(this.name),
      metadata: Buffer.from(""),
      slashingEnabled: false,
      reward: this.reward,
      minStake: this.minStake,
      authority: this._program.provider.wallet.publicKey,
    });
  }

  private async createOracles(
    oracleQueueAccount: OracleQueueAccount,
    authority: Keypair
  ): Promise<OracleSchema[]> {
    const oracleAccounts: OracleSchema[] = [];
    if (this.oracles.length === 0) return oracleAccounts;

    for await (const oracle of this.oracles) {
      oracleAccounts.push(await oracle.toSchema(oracleQueueAccount, authority));
    }
    return oracleAccounts;
  }

  private async createCranks(
    oracleQueueAccount: OracleQueueAccount
  ): Promise<CrankSchema[]> {
    const crankAccounts: CrankSchema[] = [];
    if (!this.cranks || this.cranks.length === 0) return crankAccounts;

    for await (const crank of this.cranks) {
      crankAccounts.push(await crank.toSchema(oracleQueueAccount));
    }
    return crankAccounts;
  }

  private async createDefaultFeeds(
    oracleQueueAccount: OracleQueueAccount,
    publisher: PublicKey,
    authority: Keypair
  ): Promise<AggregatorSchema[]> {
    const newAggregators: AggregatorSchema[] = [];
    newAggregators.push(
      await USDT_FEED.toSchema(oracleQueueAccount, authority, publisher)
    );
    const usdtAggregator = new PublicKey(newAggregators[0].publicKey);
    newAggregators.push(
      await SOL_FEED.toSchema(
        oracleQueueAccount,
        authority,
        publisher,
        usdtAggregator
      ),
      await BTC_FEED.toSchema(
        oracleQueueAccount,
        authority,
        publisher,
        usdtAggregator
      )
    );
    return newAggregators;
  }
}

export class OracleQueueSchema extends OracleQueueDefinition {
  @Expose()
  public secretKey!: string;

  @Expose()
  public publicKey!: string;

  @Expose()
  public programStateAccount!: string;

  @Expose()
  @Type(() => OracleSchema)
  public oracles!: OracleSchema[];

  @Expose()
  @Type(() => CrankSchema)
  public cranks!: CrankSchema[];

  @Expose()
  @Type(() => AggregatorSchema)
  public feeds!: AggregatorSchema[];

  public toAccount(): OracleQueueAccount {
    const publicKey = new PublicKey(this.publicKey);
    if (!publicKey)
      throw new Error(`failed to load Oracle Queue account ${this.publicKey}`);
    const oracleQueueAccount = new OracleQueueAccount({
      program: this._program,
      publicKey,
    });
    return oracleQueueAccount;
  }

  public async loadDefinition(
    definition: OracleQueueDefinition
  ): Promise<void> {
    await this.loadCranks(definition.cranks);
    await this.loadOracles(definition.oracles);
    if (definition.feeds) await this.loadFeeds(definition.feeds);
    await this.assignCranks();
  }

  public getProgramStateAccount(): ProgramStateAccount {
    const publicKey = new PublicKey(this.programStateAccount);
    if (!publicKey)
      throw new Error(`failed to load Program State account ${this.publicKey}`);
    const programStateAccount = new ProgramStateAccount({
      program: this._program,
      publicKey,
    });
    return programStateAccount;
  }

  public saveJson(fileName: string): void {
    const queueSchemaString = classToPlain(this);
    fs.writeFileSync(fileName, JSON.stringify(queueSchemaString, undefined, 2));
  }

  public findAggregatorByName(search: string): PublicKey | undefined {
    const feed = this.feeds.find((f) => f.name === search);
    if (feed) return new PublicKey(feed.publicKey);
  }

  public findCrankByName(search: string): CrankSchema | undefined {
    const crank = this.cranks.find((c) => c.name === search);
    if (crank) return crank;
  }

  private async loadCranks(cranks: CrankDefinition[]): Promise<void> {
    for await (const crank of cranks) {
      const existing = this.cranks.find((c) => c.name === crank.name);
      if (existing) continue;
      this.cranks.push(await crank.toSchema(this.toAccount()));
      console.log(`crank ${crank.name} added to queue`);
    }
  }

  private async loadOracles(oracles: OracleDefiniton[]): Promise<void> {
    const authority = AnchorProgram.getInstance().authority;
    for await (const o of oracles) {
      const existing = this.oracles.find((oracle) => o.name === oracle.name);
      if (existing) continue;
      this.oracles.push(await o.toSchema(this.toAccount(), authority));
      console.log(`oracle ${o.name} added to queue`);
    }
  }

  private async loadFeeds(feeds: AggregatorDefinition[]): Promise<void> {
    for await (const feed of feeds) {
      const existingFeed = this.feeds.find((f) => f.name === feed.name);
      if (existingFeed) continue;
      this.feeds.push(await this.addFeed(feed));
      console.log(`${feed.name} added to queue`);
    }
  }

  private async addFeed(feed: AggregatorDefinition): Promise<AggregatorSchema> {
    const publisher = await this.createTokenMint(this.getProgramStateAccount());
    const authority = AnchorProgram.getInstance().authority;
    const usdtAggregator = this.findAggregatorByName(USDT_FEED.name);
    const newAggregator = await feed.toSchema(
      this.toAccount(),
      authority,
      publisher,
      usdtAggregator
    );
    this.feeds.push(newAggregator);
    return newAggregator;
  }

  public async assignCranks(): Promise<void> {
    for await (const feed of this.feeds) {
      const assignedCranks: string[] = [];

      for await (const crank of feed.cranks) {
        const c = this.findCrankByName(crank);
        if (!c) {
          console.log(`failed to find crank ${crank}`);
          continue;
        }
        const existingFeeds = (await c.readFeeds()).map((f) =>
          f.pubkey.toString()
        );
        if (!existingFeeds.includes(feed.publicKey)) {
          c.addFeed(feed);
          assignedCranks.push(crank);
        }
      }
      feed.cranks = assignedCranks;
    }
  }
}
export {};
