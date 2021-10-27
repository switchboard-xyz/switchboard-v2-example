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
import { loadAnchorSync } from "../anchor";
import { getAuthorityKeypair } from "../authority";
import { keypair } from "./schema";
import {
  CrankSchema,
  OracleQueueDefinition,
  OracleSchema,
  AggregatorSchema,
  OracleQueueSchema,
} from "./";
import { Aggregator } from "./aggregator";
import { toAccountString } from "../utils";
import { loadAggregatorAccount, loadCrankAccount } from "../utils/loadAccounts";
import chalk from "chalk";

export class OracleQueue {
  private program = loadAnchorSync();
  private authority = getAuthorityKeypair();
  public queueDefinition: OracleQueueDefinition;

  constructor(queueDefinition: OracleQueueDefinition) {
    this.queueDefinition = queueDefinition;
  }

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
  public async createSchema(): Promise<OracleQueueSchema> {
    const programStateAccount = await this.createProgramStateAccount();
    console.log(toAccountString("program-state-account", programStateAccount));

    const publisher = await this.createTokenMint(programStateAccount);
    await this.transferTokens(programStateAccount, publisher, 10000);

    const oracleQueueAccount = await this.createOracleQueueAccount();
    if (!oracleQueueAccount.keypair)
      throw new Error(`oracle-queue-account missing keypair`);
    console.log(toAccountString("oracle-queue-account", oracleQueueAccount));

    const oracles = await this.createOracles(oracleQueueAccount);
    const cranks = await this.createCranks(oracleQueueAccount);
    const feeds = await this.createFeeds(oracleQueueAccount, publisher);

    if (feeds && cranks) await this.addFeedsToCranks(feeds, cranks);

    return {
      ...this.queueDefinition,
      keypair: new keypair(oracleQueueAccount.keypair),
      programStateAccount: programStateAccount.publicKey.toString(),
      oracles,
      cranks,
      feeds,
    };
  }

  private async createProgramStateAccount(): Promise<ProgramStateAccount> {
    let programAccount: ProgramStateAccount;

    try {
      [programAccount] = ProgramStateAccount.fromSeed(this.program);
    } catch (e) {
      programAccount = await ProgramStateAccount.create(this.program, {});
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
    publisher: PublicKey,
    amount: number
  ) {
    await programStateAccount.vaultTransfer(publisher, this.authority, {
      amount: new anchor.BN(amount),
    });
  }

  private async createOracleQueueAccount(): Promise<OracleQueueAccount> {
    return OracleQueueAccount.create(this.program, {
      name: Buffer.from("q1"),
      metadata: Buffer.from(""),
      slashingEnabled: false,
      reward: new anchor.BN(0),
      minStake: new anchor.BN(this.queueDefinition.minStake),
      authority: this.authority.publicKey,
    });
  }
  private async createOracles(
    oracleQueueAccount: OracleQueueAccount
  ): Promise<OracleSchema[]> {
    const oracleAccounts: OracleSchema[] = [];
    if (this.queueDefinition.oracles.length === 0) return oracleAccounts;

    for await (const o of this.queueDefinition.oracles) {
      const oracleAccount = await OracleAccount.create(this.program, {
        name: Buffer.from(o.name),
        queueAccount: oracleQueueAccount,
      });
      console.log(toAccountString(o.name, oracleQueueAccount));
      const permissionAccount = await PermissionAccount.create(this.program, {
        authority: this.authority.publicKey,
        granter: oracleQueueAccount.publicKey,
        grantee: oracleAccount.publicKey,
      });
      await permissionAccount.set({
        authority: this.authority,
        permission: SwitchboardPermission.PERMIT_ORACLE_HEARTBEAT,
        enable: true,
      });
      oracleAccounts.push({
        ...o,
        publicKey: oracleAccount.publicKey.toString(),
        queuePermissionAccount: permissionAccount.publicKey.toString(),
      });
      console.log(toAccountString(`${o.name}-permission`, oracleAccount));
    }
    return oracleAccounts;
  }

  private async createCranks(
    oracleQueueAccount: OracleQueueAccount
  ): Promise<CrankSchema[]> {
    const crankAccounts: CrankSchema[] = [];
    if (
      !this.queueDefinition.cranks ||
      this.queueDefinition.cranks.length === 0
    )
      return crankAccounts;

    for await (const o of this.queueDefinition.cranks) {
      const crankAccount = await CrankAccount.create(this.program, {
        name: Buffer.from(o.name),
        metadata: Buffer.from(""),
        queueAccount: oracleQueueAccount,
        maxRows: o.maxRows,
      });
      if (!crankAccount.keypair) throw new Error(`${o.name} missing keypair`);
      crankAccounts.push({
        ...o,
        keypair: new keypair(crankAccount.keypair),
      });
      console.log(toAccountString(`${o.name}`, crankAccount));
    }
    return crankAccounts;
  }

  private async createFeeds(
    oracleQueueAccount: OracleQueueAccount,
    publisher: PublicKey
  ): Promise<AggregatorSchema[]> {
    const aggregators: AggregatorSchema[] = [];
    for await (const f of this.queueDefinition.feeds) {
      const aggregator = new Aggregator(
        this.program,
        this.authority,
        publisher,
        oracleQueueAccount,
        f
      );
      aggregators.push(await aggregator.createSchema());
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

        // make sure aggregator is not already added to crank
        // const allCrankpqData: {
        //   pubkey: PublicKey;
        //   nextTimestamp: anchor.BN;
        // }[] = (await crankAccount.loadData()).pqData;
        // const allCrankAccounts: PublicKey[] = allCrankpqData.map(
        //   (crank: { pubkey: PublicKey; nextTimestamp: anchor.BN }) =>
        //     crank.pubkey
        // );
        // if (allCrankAccounts.indexOf(f.keypair.publicKey)) {
        //   console.log(`${chalk.red(f.name, "not added to", crankName)}`);
        //   // await crankAccount.push({ aggregatorAccount });
        // } else {
        //   await crankAccount.push({ aggregatorAccount });
        //   console.log(`${f.name} added to crank ${crankName}`);
        // }
      }
    }
  }
}
