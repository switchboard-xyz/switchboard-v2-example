import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import "mocha";
import * as AnchorFeedParser from "../target/types/anchor_feed_parser";

describe("anchor-feed-parser", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace
    .AnchorFeedParser as Program<AnchorFeedParser.AnchorFeedParser>;
  // let schema: OracleQueueSchema;

  // before(async () => {
  //   schema = await loadSchema();
  // });

  // it("Is initialized!", async () => {
  //   const sol = schema.findAggregatorByName("SOL_USD");
  //   if (!sol) throw new Error("Did not find any valid feeds to load");
  //   console.log(typeof sol, sol.toString());

  //   // const parameter: AnchorFeedParser.ReadResultParams = {};

  //   const tx = await program.rpc.readResult(
  //     {},
  //     {
  //       accounts: {
  //         aggregator: sol,
  //       },
  //     }
  //   );
  //   watchTransaction(tx);
  //   console.log("Read result signature", tx);
  // });
});
