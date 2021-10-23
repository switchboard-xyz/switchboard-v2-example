import { ProgramStateAccount } from "@switchboard-xyz/switchboard-v2";
import * as anchor from "@project-serum/anchor";
import { writePublicKey, readPublicKey, toAccountString } from "../../utils";
import { loadAnchor } from "../../anchor";

export const getProgramStateAccount = async (
  program?: anchor.Program
): Promise<ProgramStateAccount> => {
  const anchorProgram = program ? program : await loadAnchor();

  // try to read file, if not found create
  const fName = "program_account";
  const publicKey = readPublicKey(fName);
  if (publicKey) {
    try {
      const programAccount = new ProgramStateAccount({
        program: anchorProgram,
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
    programAccount = await ProgramStateAccount.create(anchorProgram, {});
  } catch (e) {
    [programAccount, _bump] = ProgramStateAccount.fromSeed(anchorProgram);
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
