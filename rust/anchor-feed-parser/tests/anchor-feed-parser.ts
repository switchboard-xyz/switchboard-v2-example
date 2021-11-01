import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Keypair, PublicKey } from "@solana/web3.js";
import { AnchorFeedParser } from "../target/types/anchor_feed_parser";

describe("on-chain-parser", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.env());

  const program = anchor.workspace
    .AnchorFeedParser as Program<AnchorFeedParser>;
  it("Is initialized!", async () => {
    // Add your test here.
    const result = Keypair.generate();

    // const tx1 = await program.rpc.initialize({
    //   accounts: {
    //     result: result.publicKey,
    //     // systemProgram: SystemProgram.programId,
    //     // payer: program.provider.wallet.publicKey,
    //   },
    // });
    // console.log("Initialization signature", tx1);

    const tx2 = await program.rpc.readResult({
      accounts: {
        aggregator: new PublicKey(
          "SqYFgjF5FpHgyX2sRQxL96T7j1RQPFNGtpctnNdGZmx"
        ),
      },
    });
    console.log("Read result signature", tx2);
  });
});
