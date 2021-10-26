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
  | "mxc"
  | "okex"
  | "orca"
  | "orcaLp";

export interface AggregatorDefinition {
  name: string;
  keypair?: Keypair;
  publicKey?: PublicKey;
  batchSize: number;
  minRequiredOracleResults: number;
  minRequiredJobResults: number;
  minUpdateDelaySeconds: number;
  jobDefinitions: {
    source: EndpointEnum;
    id: string;
    keypair?: Keypair;
    publicKey?: string;
  }[];
  queuePermissionAccount?: PublicKey;
  leaseContract?: PublicKey;
}

// export interface OracleDefinition {
//   name: string;
//   publicKey?: PublicKey;
//   queueAccount?: PublicKey;
//   queuePermissionAccount?: PublicKey;
// }

export interface OracleQueueDefinition {
  name: string;
  keypair?: Keypair;
  publicKey?: PublicKey;
  reward: anchor.BN;
  minStake: anchor.BN;
  authority: PublicKey;
  oracles: {
    name: string;
    publicKey?: PublicKey;
    queueAccount?: PublicKey;
    queuePermissionAccount?: PublicKey;
  }[];
  crankDefinitions: {
    name?: string;
    queueAccount?: PublicKey;
    maxRows?: number;
    keypair?: Keypair;
    publicKey?: PublicKey;
  }[];
  feeds: {
    name: string;
    keypair?: Keypair;
    publicKey?: PublicKey;
    batchSize: number;
    minRequiredOracleResults: number;
    minRequiredJobResults: number;
    minUpdateDelaySeconds: number;
    jobDefinitions: {
      source: EndpointEnum;
      id: string;
      keypair?: Keypair;
      publicKey?: string;
    }[];
    queuePermissionAccount?: PublicKey;
    leaseContract?: PublicKey;
  }[];
}
