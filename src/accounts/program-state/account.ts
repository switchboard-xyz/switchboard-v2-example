import { ProgramStateAccount } from "@switchboard-xyz/switchboard-v2";
import * as anchor from "@project-serum/anchor";
import { writePublicKey, readPublicKey, toAccountString } from "../../utils";

export const getProgramStateAccount = async (
  program: anchor.Program
): Promise<ProgramStateAccount> => {
  // try to read file, if not found create
  const fName = "program_account";
  const publicKey = readPublicKey(fName);
  if (publicKey) {
    try {
      const programAccount = new ProgramStateAccount({
        program,
        publicKey,
      });
      console.log(
        "Local:".padEnd(8, " "),
        toAccountString(fName, programAccount.publicKey)
      );
      return programAccount;
    } catch (err) {
      console.error(err);
    }
  }
  let programAccount: ProgramStateAccount;
  let _bump;
  try {
    programAccount = await ProgramStateAccount.create(program, {});
  } catch (e) {
    [programAccount, _bump] = ProgramStateAccount.fromSeed(program);
  }
  if (programAccount?.publicKey) {
    writePublicKey(fName, programAccount?.publicKey);
  }
  console.log(
    "Created:".padEnd(8, " "),
    toAccountString(fName, programAccount.publicKey)
  );
  return programAccount;
};
