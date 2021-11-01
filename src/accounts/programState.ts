import * as anchor from "@project-serum/anchor";
import * as spl from "@solana/spl-token";
import { Keypair, SystemProgram } from "@solana/web3.js";
import { ProgramStateAccount } from "@switchboard-xyz/switchboard-v2";
import { Exclude } from "class-transformer";
import { AnchorProgram } from "../types";
import { toAccountString } from "../utils";

export class ProgramStateDefinition {
  @Exclude()
  _program: Promise<anchor.Program> = AnchorProgram.getInstance().program;

  @Exclude()
  _authority: Keypair = AnchorProgram.getInstance().authority;

  public async toSchema(program: anchor.Program): Promise<ProgramStateAccount> {
    const authority = this._authority;
    const rand =
      Math.random().toString(36).slice(2, 15) +
      Math.random().toString(36).slice(2, 15);

    console.log("SEEDS:", rand);
    const [statePubkey, stateBump] =
      anchor.utils.publicKey.findProgramAddressSync(
        [Buffer.from(rand)],
        program.programId
      );

    console.log(
      toAccountString("program-state-account", statePubkey.toString())
    );
    console.log(toAccountString("state-bump", stateBump.toString()));
    const mintAuthority = anchor.web3.Keypair.generate();
    console.log(
      toAccountString("mint-authority", mintAuthority.publicKey.toString())
    );
    const decimals = 9;
    const mint = await spl.Token.createMint(
      program.provider.connection,
      authority,
      mintAuthority.publicKey,
      // eslint-disable-next-line unicorn/no-null
      null,
      decimals,
      spl.TOKEN_PROGRAM_ID
    );
    console.log(toAccountString("token", mint.publicKey.toString()));
    const tokenVault = await mint.createAccount(authority.publicKey);
    await mint.mintTo(
      tokenVault,
      mintAuthority.publicKey,
      [mintAuthority],
      100_000_000
    );
    console.log(toAccountString("token-vault", tokenVault.toString()));
    await program.rpc.programInit(
      {
        stateBump,
        decimals: new anchor.BN(decimals),
      },
      {
        accounts: {
          state: statePubkey,
          authority: program.provider.wallet.publicKey,
          mintAuthority: mintAuthority.publicKey,
          tokenMint: mint.publicKey,
          vault: tokenVault,
          payer: program.provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
          tokenProgram: spl.TOKEN_PROGRAM_ID,
        },
      }
    );
    return new ProgramStateAccount({
      program,
      publicKey: statePubkey,
    });
  }
}

// export class ProgramStateSchema extends ProgramStateDefinition {
//   @Expose()
//   public secretKey!: string;

//   @Expose()
//   public publicKey!: string;

//   public async toAccount(): Promise<ProgramStateAccount> {}
// }
// export {};
