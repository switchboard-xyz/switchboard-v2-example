import { PermissionAccount } from "@switchboard-xyz/switchboard-v2";
import * as anchor from "@project-serum/anchor";
import { readPublicKey } from "../../utils";

export function loadAggregatorPermissionAccount(
  fileName: string,
  feedName: string,
  program: anchor.Program
): PermissionAccount | null {
  const publicKey = readPublicKey(fileName, ["feeds", feedName]);
  if (publicKey) {
    try {
      const permissionAccount = new PermissionAccount({
        program,
        publicKey,
      });
      return permissionAccount;
    } catch (err) {
      console.error(err);
    }
  }
  return null;
}
