import {
  PermissionAccount,
  OracleQueueAccount,
  OracleAccount,
} from "@switchboard-xyz/switchboard-v2";
import * as anchor from "@project-serum/anchor";
import { writePublicKey, readPublicKey, toAccountString } from "../../utils";
import { PublicKey } from "@solana/web3.js";
import { loadAnchor } from "../../anchor";
import { getAuthorityKeypair, getOracleAccount, getOracleQueue } from "../";

export const getOracleQueuePermissionAccount = async (
  program?: anchor.Program,
  authority?: PublicKey,
  oracleQueue?: OracleQueueAccount,
  oracle?: OracleAccount
): Promise<PermissionAccount> => {
  const anchorProgram = program ? program : await loadAnchor();
  const updateAuthority = authority
    ? authority
    : getAuthorityKeypair().publicKey;
  const oracleQueueAccount = oracleQueue ? oracleQueue : await getOracleQueue();
  const oracleAccount = oracle ? oracle : await getOracleAccount();

  const fileName = "oracle_queue_permission_account";
  const publicKey = readPublicKey(fileName);
  if (publicKey) {
    try {
      const permissionAccount = new PermissionAccount({
        program: anchorProgram,
        publicKey,
      });
      console.log(
        "Local:".padEnd(8, " "),
        toAccountString(fileName, permissionAccount.publicKey)
      );
      return permissionAccount;
    } catch (err) {
      console.error(err);
    }
  }

  const permissionAccount = await PermissionAccount.create(anchorProgram, {
    authority: updateAuthority,
    granter: oracleQueueAccount.publicKey,
    grantee: oracleAccount.publicKey,
  });
  if (permissionAccount?.publicKey) {
    writePublicKey(fileName, permissionAccount?.publicKey);
  }
  console.log(
    "Created:".padEnd(8, " "),
    toAccountString(fileName, permissionAccount.publicKey)
  );
  return permissionAccount;
};
