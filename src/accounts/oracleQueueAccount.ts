import * as anchor from "@project-serum/anchor";
import { PublicKey, Keypair } from "@solana/web3.js";
import {
  OracleQueueAccount,
  ProgramStateAccount,
} from "@switchboard-xyz/switchboard-v2";
import {
  jsonObject,
  jsonMember,
  jsonArrayMember,
  toJson,
  TypedJSON,
} from "typedjson";
import { toAccountString } from "../utils";
import { loadAggregatorAccount, loadCrankAccount } from "../utils/loadAccounts";
import {
  CrankDefinition,
  CrankSchema,
  OracleDefiniton,
  AggregatorDefinition,
  AggregatorSchema,
  OracleSchema,
} from "./";
import { AnchorProgram } from "../program";
import chalk from "chalk";

TypedJSON.mapType(anchor.BN, {
  deserializer: (json) => (json == null ? json : new anchor.BN(json)),
  serializer: (value) => (value == null ? value : value.toString()),
});

TypedJSON.mapType(PublicKey, {
  deserializer: (json) => (json == null ? json : new PublicKey(json)),
  serializer: (value) => (value == null ? value : value.toString()),
});

@toJson({ overwrite: true })
@jsonObject
export class OracleQueueDefinition {
  @jsonMember
  public name!: string;
  @jsonMember
  public reward!: anchor.BN;
  @jsonMember
  public minStake!: anchor.BN;
  @jsonArrayMember(OracleDefiniton)
  public oracles!: OracleDefiniton[];
  @jsonArrayMember(CrankDefinition)
  public cranks!: CrankDefinition[];
  @jsonArrayMember(AggregatorDefinition)
  public feeds!: AggregatorDefinition[];
  public program: anchor.Program = AnchorProgram.getInstance().program;

  // constructor(
  //   name: string,
  //   reward: anchor.BN,
  //   minStake: anchor.BN,
  //   oracles?: OracleDefiniton[],
  //   cranks?: CrankDefinition[],
  //   feeds?: AggregatorDefinition[]
  // ) {
  //   this.name = name;
  //   this.reward = reward;
  //   this.minStake = minStake;
  //   if (oracles) this.oracles = oracles;
  //   if (cranks) this.cranks = cranks;
  //   if (feeds) this.feeds = feeds;
  // }
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
    await this.transferTokens(programStateAccount, authority, publisher, 10000);

    const oracleQueueAccount = await this.createOracleQueueAccount();
    if (!oracleQueueAccount.keypair)
      throw new Error(`oracle-queue-account missing keypair`);
    console.log(toAccountString("oracle-queue-account", oracleQueueAccount));

    const oracles = await this.createOracles(oracleQueueAccount, authority);
    const cranks = await this.createCranks(oracleQueueAccount);
    const feeds = await this.createFeeds(
      oracleQueueAccount,
      authority,
      publisher
    );

    if (feeds && cranks) await this.addFeedsToCranks(feeds, cranks);

    return {
      ...this,
      secretKey: oracleQueueAccount.keypair.secretKey,
      publicKey: oracleQueueAccount.keypair.publicKey,
      programStateAccount: programStateAccount.publicKey,
      oracles,
      cranks,
      feeds,
    };
  }

  private async createProgramStateAccount(): Promise<ProgramStateAccount> {
    let programAccount: ProgramStateAccount;

    try {
      programAccount = await ProgramStateAccount.create(this.program, {});
    } catch (e) {
      [programAccount] = ProgramStateAccount.fromSeed(this.program);
    }
    return programAccount;
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
    authority: Keypair,
    publisher: PublicKey,
    amount: number
  ) {
    await programStateAccount.vaultTransfer(publisher, authority, {
      amount: new anchor.BN(amount),
    });
  }

  private async createOracleQueueAccount(): Promise<OracleQueueAccount> {
    return OracleQueueAccount.create(this.program, {
      name: Buffer.from(this.name),
      metadata: Buffer.from(""),
      slashingEnabled: false,
      reward: this.reward,
      minStake: this.minStake,
      authority: this.program.provider.wallet.publicKey,
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

  private async createFeeds(
    oracleQueueAccount: OracleQueueAccount,
    authority: Keypair,
    publisher: PublicKey
  ): Promise<AggregatorSchema[]> {
    const aggregators: AggregatorSchema[] = [];
    for await (const feed of this.feeds) {
      aggregators.push(
        await feed.toSchema(oracleQueueAccount, authority, publisher)
      );
    }
    return aggregators;
  }
  private async addFeedsToCranks(
    feeds: AggregatorSchema[],
    cranks: CrankSchema[]
  ): Promise<void> {
    for await (const f of feeds) {
      if (!f.cranks) break;
      const aggregatorAccount = loadAggregatorAccount(this.program, f);
      for await (const crankName of f.cranks) {
        // find crank by name
        const crankScehma = cranks.find((c) => c.name === crankName);
        if (!crankScehma) {
          console.log(`${chalk.red("crank not found", crankName)}`);
          return;
        }
        const crankAccount = loadCrankAccount(this.program, crankScehma);
        try {
          await crankAccount.push({ aggregatorAccount });
          console.log(`${f.name} added to crank ${crankName}`);
        } catch (err) {
          console.log(`${chalk.red(f.name, "not added to", crankName)}`);
        }
      }
    }
  }
}

@toJson({ overwrite: true })
@jsonObject
export class OracleQueueSchema extends OracleQueueDefinition {
  @jsonMember
  public secretKey!: Uint8Array;
  @jsonMember
  public publicKey!: PublicKey;
  @jsonMember
  public programStateAccount!: PublicKey;
  @jsonArrayMember(OracleSchema)
  public oracles!: OracleSchema[];
  @jsonArrayMember(CrankSchema)
  public cranks!: CrankSchema[];
  @jsonArrayMember(AggregatorSchema)
  public feeds!: AggregatorSchema[];

  // constructor(
  //   name: string,
  //   reward: anchor.BN,
  //   minStake: anchor.BN,
  //   oracles: OracleSchema[],
  //   cranks: CrankSchema[],
  //   feeds: AggregatorSchema[],
  //   secretKey: Uint8Array,
  //   publicKey: PublicKey,
  //   programStateAccount: PublicKey
  // ) {
  //   super(name, reward, minStake);
  //   this.oracles = oracles;
  //   this.cranks = cranks;
  //   this.feeds = feeds;
  //   this.secretKey = secretKey;
  //   this.publicKey = publicKey;
  //   this.programStateAccount = programStateAccount;
  // }
}
export {};
