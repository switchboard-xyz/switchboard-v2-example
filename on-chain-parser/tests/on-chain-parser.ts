import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { OnChainParser } from "../target/types/on_chain_parser";

describe("on-chain-program", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.env());

  const program = anchor.workspace.OnChainProgram as Program<OnChainParser>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.rpc.readResult({});
    console.log("Your transaction signature", tx);
  });
});
