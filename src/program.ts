import * as sbv2 from "@switchboard-xyz/switchboard-v2";
import * as anchor from "@project-serum/anchor";

export const getProgramState = async (
  program: anchor.Program
): Promise<sbv2.ProgramStateAccount> => {
  let programStateAccount: sbv2.ProgramStateAccount;
  let _bump;
  try {
    programStateAccount = await sbv2.ProgramStateAccount.create(program, {});
  } catch (e) {
    [programStateAccount, _bump] = sbv2.ProgramStateAccount.fromSeed(program);
  }
  return programStateAccount;
};
