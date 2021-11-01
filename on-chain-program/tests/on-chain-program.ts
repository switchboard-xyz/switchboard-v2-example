import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { OnChainProgram } from "../target/types/on_chain_program";

describe("on-chain-program", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.env());

  const program = anchor.workspace.OnChainProgram as Program<OnChainProgram>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.rpc.initialize({});
    console.log("Your transaction signature", tx);
  });
});
