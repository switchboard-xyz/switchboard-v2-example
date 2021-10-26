import { LeaseAccount } from "@switchboard-xyz/switchboard-v2";
import * as anchor from "@project-serum/anchor";
import { readPublicKey } from "../../utils";

export const loadLeaseContract = (
  fileName: string,
  feedName: string,
  program: anchor.Program
): LeaseAccount | null => {
  const publicKey = readPublicKey(fileName, ["feeds", feedName]);
  if (publicKey) {
    try {
      const leaseContract = new LeaseAccount({
        program,
        publicKey,
      });
      return leaseContract;
    } catch (err) {
      console.error(err);
    }
  }
  return null;
};
