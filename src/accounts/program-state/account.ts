import { ProgramStateAccount } from "@switchboard-xyz/switchboard-v2";
import * as anchor from "@project-serum/anchor";
import {
  writePublicKey,
  readPublicKey,
  toAccountString,
  prettyAccountString,
} from "../../utils";
import { loadAnchor } from "../../anchor";

export const getProgramStateAccount = async (
  program?: anchor.Program
): Promise<ProgramStateAccount> => {
  const anchorProgram = program ? program : await loadAnchor();

  // try to read file, if not found create
  const fileName = "program_account";
  const publicKey = readPublicKey(fileName);
  if (publicKey) {
    try {
      const programAccount = new ProgramStateAccount({
        program: anchorProgram,
        publicKey,
      });
      console.log(
        prettyAccountString("Local", fileName, programAccount.publicKey)
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
    writePublicKey(fileName, programAccount?.publicKey);
  }
  console.log(
    prettyAccountString("Created", fileName, programAccount.publicKey)
  );
  return programAccount;
};
