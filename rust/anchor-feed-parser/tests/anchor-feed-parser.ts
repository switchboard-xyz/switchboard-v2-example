import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import * as AnchorFeedParser from "../target/types/anchor_feed_parser";

describe("anchor-feed-parser", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.env());

  const program = anchor.workspace
    .AnchorFeedParser as Program<AnchorFeedParser.AnchorFeedParser>;
  it("Is initialized!", async () => {
    const aggKey = new PublicKey(
      "H1HGzJCeVimybCMGeKgFzEPr5dNqUPnUdhTmGuwsysDB"
    );
    console.log(typeof aggKey, aggKey.toString());

    // const parameter: AnchorFeedParser.ReadResultParams = {};

    const tx = await program.rpc.readResult(
      {},
      {
        accounts: {
          aggregator: aggKey,
        },
      }
    );
    console.log("Read result signature", tx);
  });
});
