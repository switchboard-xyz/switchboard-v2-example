import { CrankAccount } from "@switchboard-xyz/switchboard-v2";
import { OracleQueueSchema } from "../accounts";
import { selectCrank } from "../utils/cli/selectCrank";
import { PublicKey } from "@solana/web3.js";
import { watchTransaction } from "../utils";

export async function popCrank(schema: OracleQueueSchema): Promise<void> {
  if (!schema.cranks) throw new Error("no cranks defined in schema");
  const crank: CrankAccount = await selectCrank(schema.cranks);
  const txn = await crank.pop({
    payoutWallet: crank.program.provider.wallet.publicKey,
    queuePubkey: new PublicKey(schema.publicKey),
    queueAuthority: crank.program.provider.wallet.publicKey,
  });
  console.log(txn);
  await watchTransaction(txn);
}
