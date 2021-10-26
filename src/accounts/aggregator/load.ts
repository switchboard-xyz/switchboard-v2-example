import { AggregatorAccount } from "@switchboard-xyz/switchboard-v2";
import * as anchor from "@project-serum/anchor";
import { prettyAccountString, readSecretKey } from "../../utils";

export const loadAggregatorAccount = (
  feedName: string,
  program: anchor.Program
): AggregatorAccount | null => {
  const fileName = "aggregator_account";
  const keypair = readSecretKey(fileName, ["feeds", feedName]);
  if (keypair) {
    try {
      const aggregatorAccount = new AggregatorAccount({
        program,
        keypair,
      });
      if (aggregatorAccount.publicKey)
        console.log(
          prettyAccountString("Local:", fileName, aggregatorAccount.publicKey)
        );
      return aggregatorAccount;
    } catch (err) {
      console.error(err);
    }
  }
  return null;
};
