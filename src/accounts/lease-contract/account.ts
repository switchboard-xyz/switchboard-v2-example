import {
  OracleAccount,
  OracleQueueAccount,
  LeaseAccount,
} from "@switchboard-xyz/switchboard-v2";
import * as anchor from "@project-serum/anchor";
import {
  writePublicKey,
  readPublicKey,
  writeSecretKey,
  toAccountString,
} from "../../utils";
import { ConfigError } from "../../types";
import { loadAnchor } from "../../anchor";
import { getOracleQueue } from "../";

/**
 * checks for public key file and if not found creates PDA account of oracle queue
 * @returns oracle account
 */
export const getLeaseContractAccount = async (
  program?: anchor.Program,
  queueAccount?: OracleQueueAccount
): Promise<LeaseAccount | null> => {
  const anchorProgram = program ? program : await loadAnchor();
  const oracleQueueAccount = queueAccount
    ? queueAccount
    : await getOracleQueue();
  // try to read file, if not found create
  const fileName = "lease_contract";
  const readKey = readPublicKey(fileName);
  if (readKey) {
    try {
      const leaseContract = new LeaseAccount({
        program: anchorProgram,
        publicKey: readKey,
      });
      if (leaseContract?.keypair) {
        writeSecretKey(fileName, leaseContract?.keypair);
      }
      console.log(
        "Local:".padEnd(8, " "),
        toAccountString(fileName, leaseContract.publicKey)
      );
      return leaseContract;
    } catch (err) {
      console.error(err);
    }
  }
  if (!oracleQueueAccount)
    throw new ConfigError("queueAccount not created yet");
  return null;

  //   const leaseContract = await LeaseAccount.create(anchorProgram, {
  //     loadAmount: new anchor.BN(1000),
  //     funder: authority.publicKey,
  //     funderAuthority: authority,
  //     oracleQueueAccount: authority,
  //     aggregatorAccount: authority,
  //   });
  //   if (leaseContract?.publicKey) {
  //     writePublicKey(fileName, leaseContract?.publicKey);
  //   }
  //   if (leaseContract?.keypair) {
  //     writeSecretKey(fileName, leaseContract?.keypair);
  //   }
  //   console.log(
  //     "Created:".padEnd(8, " "),
  //     toAccountString(fileName, leaseContract.publicKey)
  //   );
  //   return leaseContract;
};
