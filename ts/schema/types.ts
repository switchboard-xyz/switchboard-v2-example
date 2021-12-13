import { Keypair, PublicKey } from "@solana/web3.js";
import { OracleJob } from "@switchboard-xyz/switchboard-api";
import {
  CrankAccount,
  OracleAccount,
  OracleQueueAccount,
} from "@switchboard-xyz/switchboard-v2";

export interface PdaSchema {
  name?: string;
  publicKey?: PublicKey;
}

export interface AuthoritySchema extends PdaSchema {
  secretKey?: Uint8Array;
}

export interface PermissionSchema extends PdaSchema {
  queuePermission: string;
  expiration?: number;
  granter?: PublicKey;
  grantee?: PublicKey;
}

export interface OracleSchema extends PdaSchema {
  permission: PermissionSchema;
  tokenAccount: PublicKey;
}

export interface JobSchema extends AuthoritySchema {
  tasks?: OracleJob.ITask[];
}

export interface AggregatorSchema extends AuthoritySchema {
  name: string;
  batchSize?: number;
  minRequiredOracleResults?: number;
  minRequiredJobResults?: number;
  minUpdateDelaySeconds?: number;
  permission?: PermissionSchema;
  lease?: PdaSchema;
  jobs: JobSchema[];
}

export interface CrankSchema extends PdaSchema {
  pqSize?: number;
  maxRows?: number;
  aggregators: AggregatorSchema[];
}

export interface QueueSchema {
  queue: AuthoritySchema & { authority: PublicKey };
  oracles: OracleSchema[];
  cranks: CrankSchema[];
}

export interface ParsedQueueSchema {
  account: OracleQueueAccount;
  authority: Keypair;
  cranks: CrankAccount[];
  oracles: OracleAccount[];
}

export interface QueueDefinition {
  name: string;
  metadata?: string;
  reward?: number;
  minStake?: number;
  minUpdateDelaySeconds?: number;
  oracleTimeout?: number;
  cranks?: {
    name: string;
    metadata?: string;
    maxRows?: number;
  }[];
  oracles?: {
    name: string;
    metadata?: string;
  }[];
}
