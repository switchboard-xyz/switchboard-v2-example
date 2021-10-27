import * as anchor from "@project-serum/anchor";
import { CrankAccount } from "@switchboard-xyz/switchboard-v2";
import { OracleQueueSchema } from "../accounts";
import { selectCrank } from "../utils/cli/selectCrank";
import { RPC_URL } from "../main";
import { PublicKey } from "@solana/web3.js";

interface pqData {
  pubkey: PublicKey;
  nextTimestamp: anchor.BN;
}

export async function readCrank(
  program: anchor.Program,
  schema: OracleQueueSchema
): Promise<void> {
  if (!schema.cranks) throw new Error("no cranks defined in schema");
  const crankAccount: CrankAccount = await selectCrank(program, schema.cranks);
  const xx = await crankAccount.peakNextReady(10);
  console.log(JSON.stringify(xx, null, 2));
  const zeroString = new anchor.BN(0).toString();
  const allCrankpqData: pqData[] = (await crankAccount.loadData()).pqData;
  const allCrankAccounts: pqData[] = allCrankpqData.filter((c) => {
    if (c.nextTimestamp.toString() !== zeroString) {
      return true;
    }
    return false;
  });
  // console.log(JSON.stringify(allCrankAccounts, null, 2));
}
