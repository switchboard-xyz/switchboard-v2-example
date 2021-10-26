import { OracleAccount } from "@switchboard-xyz/switchboard-v2";
import * as anchor from "@project-serum/anchor";
import { writePublicKey, readPublicKey } from "../../utils";

export function loadOracleAccount(
  fileName: string,
  program: anchor.Program
): OracleAccount | null {
  const publicKey = readPublicKey(fileName);
  if (publicKey) {
    try {
      const oracleAccount = new OracleAccount({
        program,
        publicKey,
      });
      return oracleAccount;
    } catch (err) {
      console.error(err);
    }
  }
  return null;
}
