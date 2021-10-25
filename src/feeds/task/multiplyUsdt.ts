import { PublicKey } from "@solana/web3.js";
import { OracleJob } from "@switchboard-xyz/switchboard-api";
import { AggregatorAccount } from "@switchboard-xyz/switchboard-v2";
import { loadAnchor } from "../../anchor";
import { ConfigError } from "../../types";
import { readSecretKey } from "../../utils";

// const USDT_PUBKEY = new PublicKey(
//   "5mp8kbkTYwWWCsKSte8rURjTuyinsqBpJ9xAQsewPDD"
// );

async function getUSDT(): Promise<AggregatorAccount> {
  const anchorProgram = await loadAnchor();
  // const fileName = "USDT_USD_aggregator_account";
  const readKey = readSecretKey("USDT_USD", ["feeds"]);
  if (readKey) {
    try {
      const aggregatorAccount = new AggregatorAccount({
        program: anchorProgram,
        keypair: readKey,
      });
      return aggregatorAccount;
    } catch (err) {
      console.error(err);
    }
  }
  throw new ConfigError(
    "Failed to read USDT public key. Has an aggregator account been created for it yet?"
  );
}

export async function multiplyUsdtTask(): Promise<OracleJob.Task> {
  const usdtAccount = await getUSDT();
  if (!usdtAccount.publicKey)
    throw new ConfigError("failed to get USDT public key");
  return OracleJob.Task.create({
    multiplyTask: OracleJob.MultiplyTask.create({
      aggregatorPubkey: usdtAccount.publicKey.toBase58(),
    }),
  });
}
