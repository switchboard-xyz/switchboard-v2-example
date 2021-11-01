import * as anchor from "@project-serum/anchor";
import * as spl from "@solana/spl-token";
import { ProgramStateAccount } from "@switchboard-xyz/switchboard-v2";
import { toAccountString } from ".";
import { AnchorProgram } from "../types";

export const createProgramStateAccount = async (
  program: anchor.Program
): Promise<ProgramStateAccount> => {
  const authority = AnchorProgram.getInstance().authority;
  //   const payerKeypair = (program.provider.wallet as any).payer;
  const rand =
    Math.random().toString(36).slice(2, 13) +
    Math.random().toString(36).slice(2, 15);

  const payerKeypair = authority;
  const [statePubkey, stateBump] =
    anchor.utils.publicKey.findProgramAddressSync(
      [Buffer.from("STATE" + rand)],
      program.programId
    );
  const stateAccount = new ProgramStateAccount({
    program,
    publicKey: statePubkey,
  });
  console.log("SEEDS:", rand);
  console.log(
    toAccountString("program-state-account", stateAccount.publicKey.toString())
  );
  console.log(toAccountString("state-bump", stateBump.toString()));
  const mintAuthority = anchor.web3.Keypair.generate();
  console.log(
    toAccountString("mint-authority", mintAuthority.publicKey.toString())
  );
  const decimals = 9;
  const mint = await spl.Token.createMint(
    program.provider.connection,
    payerKeypair,
    mintAuthority.publicKey,
    // eslint-disable-next-line unicorn/no-null
    null,
    decimals,
    spl.TOKEN_PROGRAM_ID
  );
  console.log(toAccountString("token", mint.publicKey.toString()));
  const tokenVault = await mint.createAccount(
    program.provider.wallet.publicKey
  );
  console.log(toAccountString("token-vault", tokenVault.toString()));
  await mint.mintTo(
    tokenVault,
    mintAuthority.publicKey,
    [mintAuthority],
    100_000_000
  );

  return new ProgramStateAccount({
    program,
    publicKey: stateAccount.publicKey,
  });
};
