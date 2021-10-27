import * as anchor from "@project-serum/anchor";
import { Keypair, PublicKey } from "@solana/web3.js";
import {
  AggregatorAccount,
  CrankAccount,
  LeaseAccount,
  OracleAccount,
  OracleQueueAccount,
  PermissionAccount,
  ProgramStateAccount,
} from "@switchboard-xyz/switchboard-v2";
import { CrankSchema, AggregatorSchema, OracleQueueSchema } from "../accounts";
import { unwrapSecretKey } from "../types";

export function loadCrankAccount(
  program: anchor.Program,
  crank: CrankSchema
): CrankAccount {
  const keypair = Keypair.fromSecretKey(unwrapSecretKey(crank.secretKey));
  const crankAccount = new CrankAccount({
    program,
    keypair,
  });

  return crankAccount;
}

export function loadAggregatorAccount(
  program: anchor.Program,
  aggregator: AggregatorSchema
): AggregatorAccount {
  // const keypair = getKeypair(aggregator.keypair);
  const keypair = Keypair.fromSecretKey(unwrapSecretKey(aggregator.secretKey));
  const aggregatorAccount = new AggregatorAccount({
    program,
    keypair,
  });
  return aggregatorAccount;
}

export function loadOracleQueueAccount(
  program: anchor.Program,
  oracleQueue: OracleQueueSchema
): OracleQueueAccount {
  // const keypair = getKeypair(oracleQueue.keypair);
  const keypair = Keypair.fromSecretKey(unwrapSecretKey(oracleQueue.secretKey));
  const oracleQueueAccount = new OracleQueueAccount({
    program,
    keypair,
  });
  return oracleQueueAccount;
}

export function loadPermissionAccount(
  program: anchor.Program,
  permissionKey: string
): PermissionAccount {
  const publicKey = new PublicKey(permissionKey);
  if (!publicKey)
    throw new Error(`failed to load Permission account ${permissionKey}`);
  const permissionAccount = new PermissionAccount({
    program,
    publicKey,
  });
  return permissionAccount;
}

export function loadLeaseContract(
  program: anchor.Program,
  leaseKey: string
): LeaseAccount {
  const publicKey = new PublicKey(leaseKey);
  if (!publicKey)
    throw new Error(`failed to load Lease Contract account ${leaseKey}`);
  const leaseContract = new LeaseAccount({
    program,
    publicKey,
  });
  return leaseContract;
}

export function loadProgramStateAccount(
  program: anchor.Program,
  programStateKey: string
): ProgramStateAccount {
  const publicKey = new PublicKey(programStateKey);
  if (!publicKey)
    throw new Error(`failed to load Program State account ${programStateKey}`);
  const programStateAccount = new ProgramStateAccount({
    program,
    publicKey,
  });
  return programStateAccount;
}

export function loadOracleAccount(
  program: anchor.Program,
  oracleKey: string
): OracleAccount {
  const publicKey = new PublicKey(oracleKey);
  if (!publicKey) throw new Error(`failed to load Oracle account ${oracleKey}`);
  const oracleAccount = new OracleAccount({
    program,
    publicKey,
  });
  return oracleAccount;
}
