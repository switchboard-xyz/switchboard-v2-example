import {
  PermissionAccount,
  OracleQueueAccount,
  OracleAccount,
} from "@switchboard-xyz/switchboard-v2";
import * as anchor from "@project-serum/anchor";
import { writePublicKey, readPublicKey, toAccountString } from "../../utils";

export const getOracleQueuePermissionAccount = async (
  program: anchor.Program,
  wallet: anchor.Wallet,
  oracleQueueAccount: OracleQueueAccount,
  oracleAccount: OracleAccount
): Promise<PermissionAccount> => {
  // try to read file, if not found create
  const fName = "oracle_queue_permission_account";
  const readKey = readPublicKey(fName);
  if (readKey) {
    try {
      const permissionAccount = new PermissionAccount({
        program,
        publicKey: readKey,
      });
      console.log(
        "Local:".padEnd(8, " "),
        toAccountString(fName, permissionAccount.publicKey)
      );
      return permissionAccount;
    } catch (err) {
      console.error(err);
    }
  }

  const permissionAccount = await PermissionAccount.create(program, {
    authority: wallet.publicKey,
    granter: oracleQueueAccount.publicKey,
    grantee: oracleAccount.publicKey,
  });
  if (permissionAccount?.publicKey) {
    writePublicKey(fName, permissionAccount?.publicKey);
  }
  console.log(
    "Created:".padEnd(8, " "),
    toAccountString(fName, permissionAccount.publicKey)
  );
  return permissionAccount;
};
