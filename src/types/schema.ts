import { Keypair, PublicKey } from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";

export type EndpointEnum =
  | "binanceCom"
  | "binanceUs"
  | "bitfinex"
  | "bitstamp"
  | "bittrex"
  | "coinbase"
  | "ftxCom"
  | "ftxUs"
  | "huobi"
  | "kraken"
  | "kucoin"
  | "mxc"
  | "okex"
  | "orca"
  | "orcaLp";

export interface JobDefinition {
  source: EndpointEnum;
  id: string;
}
export interface JobSchema extends JobDefinition {
  keypair?: keypair;
}

export interface AggregatorDefinition {
  name: string;
  batchSize: number;
  minRequiredOracleResults: number;
  minRequiredJobResults: number;
  minUpdateDelaySeconds: number;
  jobs: JobDefinition[];
}
export interface AggregatorSchema extends AggregatorDefinition {
  keypair?: keypair;
  queuePermissionAccount: string;
  leaseContract: string;
  jobs: JobSchema[];
}

export interface CrankDefinition {
  name: string;
  maxRows: number;
}
export interface CrankSchema extends CrankDefinition {
  keypair?: keypair;
}
export interface OracleDefiniton {
  name: string;
}
export interface OracleSchemaDefinition extends OracleDefiniton {
  publicKey?: string;
  queuePermissionAccount?: string;
}

export interface OracleQueueDefinition {
  type: string;
  name: string;
  reward: anchor.BN;
  minStake: anchor.BN;
  oracles: OracleDefiniton[];
  cranks: CrankDefinition[];
  feeds: AggregatorDefinition[];
}

export interface OracleQueueSchema extends OracleQueueDefinition {
  keypair?: keypair;
  programStateAccount: string;
  oracles: OracleSchemaDefinition[];
  cranks: CrankSchema[];
  feeds: AggregatorSchema[];
}

export class keypair {
  public secretKey?: Uint8Array;
  public publicKey?: PublicKey;

  constructor(k: Keypair) {
    this.secretKey = k.secretKey;
    this.publicKey = k.publicKey;
  }
  public toJSON(): any {
    return {
      secretKey: `[${this.secretKey}]`,
      publicKey: `${this.publicKey?.toString()}`,
    };
  }
  // public toKeypair(): Keypair {
  //   return new Keypair.fromSecretKey(this.secretKey);
  // }
}
