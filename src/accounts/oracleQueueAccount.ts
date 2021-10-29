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
  _program: Promise<anchor.Program> = AnchorProgram.getInstance().program;

  @Exclude()
  _authority: Keypair = AnchorProgram.getInstance().authority;

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
   * 2. Funds publisher token account for adding new feeds
   * 3. Creates new OracleQueue account
   * 4. Creates new Oracles and adds them to the queue
   * 5. Creates new Cranks and adds them to the queue
   * 6. Creates new Aggregator accounts, with job definitions, and funds leaseContract
   * 7. Adds aggregators to cranks
   */
  public async toSchema(): Promise<OracleQueueSchema> {
    console.log(
      toAccountString("authority", this._authority.publicKey.toString())
    );
    let programStateAccount: ProgramStateAccount;
    try {
      programStateAccount = await ProgramStateAccount.create(
        await this._program,
        {}
      );
    } catch {
      [programStateAccount] = ProgramStateAccount.fromSeed(await this._program);
    }
    console.log(toAccountString("program-state-account", programStateAccount));

    const switchTokenMint = await programStateAccount.getTokenMint();
    console.log(
      toAccountString("token-mint", switchTokenMint.publicKey.toString())
    );
    const publisher = await switchTokenMint.createAccount(
      this._authority.publicKey
    );
    console.log(toAccountString("publisher-account", publisher.toString()));

    await programStateAccount.vaultTransfer(publisher, this._authority, {
      amount: new anchor.BN(100_000),
    });

    const oracleQueueAccount = await this.createOracleQueueAccount();
    if (!oracleQueueAccount.keypair)
      throw new Error(`oracle-queue-account missing keypair`);
    console.log(toAccountString("oracle-queue-account", oracleQueueAccount));

    const oracles = await this.createOracles(oracleQueueAccount);
    const cranks = await this.createCranks(oracleQueueAccount);

    const feeds = await this.createDefaultFeeds(oracleQueueAccount, publisher);

    return plainToClass(OracleQueueSchema, {
      ...this,
      secretKey: `[${oracleQueueAccount.keypair.secretKey}]`,
      publicKey: oracleQueueAccount.keypair.publicKey.toString(),
      publisher: publisher.toString(),
      programStateAccount: programStateAccount.publicKey.toString(),
      oracles,
      cranks,
      feeds,
    });
  }

  private async createOracleQueueAccount(): Promise<OracleQueueAccount> {
    return OracleQueueAccount.create(await this._program, {
      name: Buffer.from(this.name),
      metadata: Buffer.from(""),
      slashingEnabled: false,
      reward: this.reward,
      minStake: this.minStake,
      authority: this._authority.publicKey,
    });
  }

  private async createOracles(
    oracleQueueAccount: OracleQueueAccount
  ): Promise<OracleSchema[]> {
    const oracleAccounts: OracleSchema[] = [];
    if (this.oracles.length === 0) return oracleAccounts;

    for await (const oracle of this.oracles) {
      oracleAccounts.push(await oracle.toSchema(oracleQueueAccount));
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
    publisher: PublicKey
  ): Promise<AggregatorSchema[]> {
    const newAggregators: AggregatorSchema[] = [];
    newAggregators.push(
      await USDT_FEED.toSchema(oracleQueueAccount, publisher)
    );
    const usdtAggregator = new PublicKey(newAggregators[0].publicKey);
    newAggregators.push(
      await SOL_FEED.toSchema(oracleQueueAccount, publisher, usdtAggregator),
      await BTC_FEED.toSchema(oracleQueueAccount, publisher, usdtAggregator)
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
  public publisher!: string;

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

  public async toAccount(): Promise<OracleQueueAccount> {
    const publicKey = new PublicKey(this.publicKey);
    if (!publicKey)
      throw new Error(`failed to load Oracle Queue account ${this.publicKey}`);
    const oracleQueueAccount = new OracleQueueAccount({
      program: await this._program,
      publicKey,
    });
    return oracleQueueAccount;
  }

  public async fundTokens(): Promise<void> {
    const programStateAccount = await this.getProgramStateAccount();
    const publisher = await this.getAuthorityTokenAccount();
    await programStateAccount.vaultTransfer(publisher, this._authority, {
      amount: new anchor.BN(100_000),
    });
    console.log(
      `Authority token account ${publisher} funded with 100,000 tokens`
    );
  }

  public async loadDefinition(
    definition: OracleQueueDefinition
  ): Promise<void> {
    await this.loadCranks(definition.cranks);
    await this.loadOracles(definition.oracles);
    if (definition.feeds) await this.loadFeeds(definition.feeds);
    await this.assignCranks();
  }

  public async getProgramStateAccount(): Promise<ProgramStateAccount> {
    const publicKey = new PublicKey(this.programStateAccount);
    if (!publicKey)
      throw new Error(`failed to load Program State account ${this.publicKey}`);
    const programStateAccount = new ProgramStateAccount({
      program: await this._program,
      publicKey,
    });
    return programStateAccount;
  }

  public async getAuthorityTokenAccount(): Promise<PublicKey> {
    return new PublicKey(this.publisher);
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
      this.cranks.push(await crank.toSchema(await this.toAccount()));
      console.log(`crank ${crank.name} added to queue`);
    }
  }

  private async loadOracles(oracles: OracleDefiniton[]): Promise<void> {
    for await (const o of oracles) {
      const existing = this.oracles.find((oracle) => o.name === oracle.name);
      if (existing) continue;
      this.oracles.push(await o.toSchema(await this.toAccount()));
      console.log(`oracle ${o.name} added to queue`);
    }
  }

  public async printOracles(): Promise<void> {
    const queueAccount = await this.toAccount();
    const zeroKey = new PublicKey("11111111111111111111111111111111");
    let queues: PublicKey[] = (await queueAccount.loadData()).queue;

    queues = queues.filter((f) => !f.equals(zeroKey));
    console.log(queues);
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
    const publisher = await this.getAuthorityTokenAccount();
    const usdtAggregator = this.findAggregatorByName(USDT_FEED.name);
    const newAggregator = await feed.toSchema(
      await this.toAccount(),
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
