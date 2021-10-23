import {
  PermissionAccount,
  OracleQueueAccount,
  OracleAccount,
} from "@switchboard-xyz/switchboard-v2";
import * as anchor from "@project-serum/anchor";
import { writePublicKey } from "../utils/writePublicKey";
import { readPublicKey } from "../utils/readPublicKey";

export const getPermissionAccount = async (
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
      console.log(`loaded ${fName} from local storage`);
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
    console.log(`saving ${fName}`);
    writePublicKey(fName, permissionAccount?.publicKey);
  }
  console.log(`created ${fName}`);
  return permissionAccount;
};
