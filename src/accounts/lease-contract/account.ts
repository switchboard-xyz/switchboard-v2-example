import {
  AggregatorAccount,
  OracleQueueAccount,
  LeaseAccount,
} from "@switchboard-xyz/switchboard-v2";
import * as anchor from "@project-serum/anchor";
import { readPublicKey, toAccountString, writeKeys } from "../../utils";
import { ConfigError } from "../../types";
import { loadAnchor } from "../../anchor";
import { getOracleQueue, getAuthorityKeypair } from "../";
import { Keypair, PublicKey } from "@solana/web3.js";

export const loadLeaseContract = async (
  feedName: string,
  program?: anchor.Program
): Promise<LeaseAccount | null> => {
  const anchorProgram = program ? program : await loadAnchor();
  const readKey = readPublicKey("lease_contract", ["feeds", feedName]);
  if (readKey) {
    try {
      const leaseContract = new LeaseAccount({
        program: anchorProgram,
        publicKey: readKey,
      });
      return leaseContract;
    } catch (err) {
      console.error(err);
    }
  }
  return null;
};

export const getLeaseContractAccount = async (
  feedName: string,
  aggregatorAccount: AggregatorAccount,
  funder: PublicKey,
  program?: anchor.Program,
  authority?: Keypair,
  queueAccount?: OracleQueueAccount
): Promise<LeaseAccount | null> => {
  const anchorProgram = program ? program : await loadAnchor();
  const oracleQueueAccount = queueAccount
    ? queueAccount
    : await getOracleQueue();
  const funderAuthority = authority ? authority : await getAuthorityKeypair();
  // try to read file, if not found create

  if (!oracleQueueAccount)
    throw new ConfigError("queueAccount not created yet");

  const lseContract = await loadLeaseContract("feedName", anchorProgram);
  if (lseContract) return lseContract;

  const leaseContract = await LeaseAccount.create(anchorProgram, {
    loadAmount: new anchor.BN(100),
    funder: funder,
    funderAuthority,
    oracleQueueAccount,
    aggregatorAccount,
  });
  writeKeys("lease_contract", leaseContract, ["feeds", feedName]);
  if (leaseContract.publicKey)
    console.log(
      "Created:".padEnd(8, " "),
      toAccountString(feedName, leaseContract?.publicKey)
    );
  return leaseContract;
};
