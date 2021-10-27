import * as anchor from "@project-serum/anchor";
import { CrankAccount } from "@switchboard-xyz/switchboard-v2";
import { OracleQueueSchema } from "../accounts";
import { selectCrank } from "../utils/cli/selectCrank";
import { PublicKey } from "@solana/web3.js";

interface pqData {
  pubkey: PublicKey;
  nextTimestamp: anchor.BN;
}

// TO DO: Map crank public keys to aggregator names
export async function readCrank(schema: OracleQueueSchema): Promise<void> {
  if (!schema.cranks) throw new Error("no cranks defined in schema");
  const crankAccount: CrankAccount = await selectCrank(schema.cranks);
  const crankPeak = await (
    await crankAccount.peakNextReady(10)
  ).map((c) => c.toString());
  console.log(JSON.stringify(crankPeak, null, 2));
}
