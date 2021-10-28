import { SendTxRequest } from "@project-serum/anchor/dist/cjs/provider";
import { Keypair } from "@solana/web3.js";
import { OracleQueueSchema } from "../accounts";
import { watchTransaction } from "../utils";
import { selectCrank } from "../utils/cli/selectCrank";

export async function popCrank(
  schema: OracleQueueSchema,
  authority: Keypair
): Promise<void> {
  if (!schema.cranks) throw new Error("no cranks defined in schema");
  const crankSchema = await selectCrank(schema.cranks);
  const crankAccount = crankSchema.toAccount();

  const payoutWallet = schema._program.provider.wallet.publicKey;
  const queueAccount = schema.toAccount();
  const queueAuthority = authority.publicKey;
  // const programStateAccount = schema.getProgramState();

  try {
    const readyPubkeys = await crankAccount.peakNextReady(5);
    const txns: SendTxRequest[] = [];
    for (let index = 0; index < readyPubkeys.length; ++index) {
      txns.push({
        tx: await crankAccount.popTxn({
          payoutWallet,
          queuePubkey: queueAccount.publicKey,
          queueAuthority,
          readyPubkeys,
          nonce: index,
        }),
        signers: [],
      });
    }
    const signatures = await schema._program.provider.sendAll(txns);
    console.log("Crank turned");
    await Promise.all(signatures.map(async (s) => watchTransaction(s)));
  } catch (error) {
    console.error(error);
  }
}

// const txn = await crank.pop({
//   payoutWallet: crank.program.provider.wallet.publicKey,
//   queuePubkey: new PublicKey(schema.publicKey),
//   queueAuthority: crank.program.provider.wallet.publicKey,
// });
// console.log(txn);
// await watchTransaction(txn);
