import { AggregatorAccount } from "@switchboard-xyz/switchboard-v2";
import * as anchor from "@project-serum/anchor";
import { readSecretKey } from "../../utils";

export const loadAggregatorAccount = (
  feedName: string,
  program: anchor.Program
): AggregatorAccount | null => {
  const keypair = readSecretKey("aggregator_account", ["feeds", feedName]);
  if (keypair) {
    try {
      const aggregatorAccount = new AggregatorAccount({
        program,
        keypair,
      });
      return aggregatorAccount;
    } catch (err) {
      console.error(err);
    }
  }
  return null;
};
