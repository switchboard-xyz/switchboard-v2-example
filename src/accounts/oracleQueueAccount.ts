import * as anchor from "@project-serum/anchor";
import { PublicKey, Keypair } from "@solana/web3.js";
import {
  OracleQueueAccount,
  ProgramStateAccount,
} from "@switchboard-xyz/switchboard-v2";
import { Expose, Type, Exclude, plainToClass } from "class-transformer";
import { toAccountString } from "../utils";
import {
  CrankDefinition,
  CrankSchema,
  OracleDefiniton,
  AggregatorDefinition,
  AggregatorSchema,
  OracleSchema,
} from "./";
import { AnchorProgram } from "../types/anchorProgram";
import chalk from "chalk";
import TransformAnchorBN from "../types/transformAnchorBN";

export class OracleQueueDefinition {
  @Exclude()
  _program: anchor.Program = AnchorProgram.getInstance().program;
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
  public feeds!: AggregatorDefinition[];

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
    } catch (e) {
      [programAccount] = ProgramStateAccount.fromSeed(this._program);
    }
    return programAccount;
  }

  private async createTokenMint(
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
      const aggregatorAccount = f.toAccount();
      for await (const crankName of f.cranks) {
        // find crank by name
        const crankScehma = cranks.find((c) => c.name === crankName);
        if (!crankScehma) {
          console.log(`${chalk.red("crank not found", crankName)}`);
          return;
        }
        const crankAccount = crankScehma.toAccount();
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
  public getProgramState(): ProgramStateAccount {
    const publicKey = new PublicKey(this.programStateAccount);
    if (!publicKey)
      throw new Error(`failed to load Program State account ${this.publicKey}`);
    const programStateAccount = new ProgramStateAccount({
      program: this._program,
      publicKey,
    });
    return programStateAccount;
  }
}
export {};
