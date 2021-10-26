import {
  PermissionAccount,
  OracleQueueAccount,
  OracleAccount,
} from "@switchboard-xyz/switchboard-v2";
import * as anchor from "@project-serum/anchor";
import { writePublicKey, readPublicKey, toAccountString } from "../../utils";
import { PublicKey } from "@solana/web3.js";
import { loadAnchor } from "../../anchor";
import { getAuthorityKeypair, getOracleAccount, getOracleQueue } from "..";
import { loadOraclePermissionAccount } from "./load";

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

  const fileName = "oracle_permission_account";
  const permAccount = loadOraclePermissionAccount(fileName, anchorProgram);
  if (permAccount) return permAccount;

  const permissionAccount = await PermissionAccount.create(anchorProgram, {
    authority: updateAuthority,
    granter: oracleQueueAccount.publicKey,
    grantee: oracleAccount.publicKey,
  });
  if (permissionAccount?.publicKey) {
    writePublicKey(fileName, permissionAccount?.publicKey);
  }

  return permissionAccount;
};
