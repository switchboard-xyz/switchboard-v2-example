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

// export interface JobDefinition {
//   source: EndpointEnum;
//   id: string;
// }
// export interface JobSchema extends JobDefinition {
//   keypair: keypair;
// }

// export interface AggregatorDefinition {
//   name: string;
//   batchSize: number;
//   minRequiredOracleResults: number;
//   minRequiredJobResults: number;
//   minUpdateDelaySeconds: number;
//   cranks?: string[];
//   jobs: JobDefinition[];
// }
// export interface AggregatorSchema extends AggregatorDefinition {
//   keypair: keypair;
//   queuePermissionAccount: string;
//   leaseContract: string;
//   jobs: JobSchema[];
// }

// export interface CrankDefinition {
//   name: string;
//   maxRows: number;
// }
// export interface CrankSchema extends CrankDefinition {
//   keypair: keypair;
// }
// export interface OracleDefiniton {
//   name: string;
// }
// export interface OracleSchema extends OracleDefiniton {
//   publicKey: string;
//   queuePermissionAccount?: string;
// }

// export interface OracleQueueDefinition {
//   name: string;
//   reward: anchor.BN;
//   minStake: anchor.BN;
//   oracles: OracleDefiniton[];
//   cranks: CrankDefinition[];
//   feeds: AggregatorDefinition[];
// }

// export interface OracleQueueSchema extends OracleQueueDefinition {
//   keypair: keypair;
//   programStateAccount: string;
//   oracles: OracleSchema[];
//   cranks: CrankSchema[];
//   feeds: AggregatorSchema[];
// }

export class keypair {
  public secretKey: Uint8Array;
  public publicKey: PublicKey;

  constructor(k: Keypair) {
    this.secretKey = k.secretKey;
    this.publicKey = k.publicKey;
  }
  // public getSecretKey(): Uint8Array {
  //   const obj: Uint8Array = JSON.parse(this.secretKey);
  //   console.log(obj);
  //   return Uint8Array.from(obj);
  // }
  // public getPublicKey(): PublicKey {
  //   return new PublicKey(this.publicKey);
  // }
  // public getKeypair(): Keypair {
  //   const secretKey = new Uint8Array(this.secretKey);
  //   return Keypair.fromSecretKey(secretKey);
  // }
  public toJSON(): keypairJSON {
    const json: keypairJSON = {
      secretKey: `[${this.secretKey}]`,
      publicKey: this.publicKey.toString(),
    };
    return json;
  }
}

interface keypairJSON {
  secretKey: string;
  publicKey: string;
}

// JSON.parse doesnt create instance of class so doesnt inherit functions
// TO DO: Capture interfaces on Ikeypair
export function getKeypair(keypair: keypair): Keypair {
  const secretKey = keypair.secretKey.toString();
  const secretArray = new Uint8Array(JSON.parse(secretKey));
  return Keypair.fromSecretKey(secretArray);
}
