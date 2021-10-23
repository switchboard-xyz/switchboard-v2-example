// import { ProgramStateAccount } from "@switchboard-xyz/switchboard-v2";
// import * as anchor from "@project-serum/anchor";

// export const getProgramState = async (
//   program: anchor.Program
// ): Promise<ProgramStateAccount> => {
//   let programStateAccount: ProgramStateAccount;
//   let _bump;
//   try {
//     programStateAccount = await ProgramStateAccount.create(program, {});
//   } catch (e) {
//     [programStateAccount, _bump] = ProgramStateAccount.fromSeed(program);
//   }
//   return programStateAccount;
// };

import { ProgramStateAccount } from "@switchboard-xyz/switchboard-v2";
import * as anchor from "@project-serum/anchor";
import { writePublicKey } from "./utils/writePublicKey";
import { readPublicKey } from "./utils/readPublicKey";

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
      console.log(`loaded ${fName} from local storage`);
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
    console.log(`saving ${fName}`);
    writePublicKey(fName, programAccount?.publicKey);
  }
  return programAccount;
};
