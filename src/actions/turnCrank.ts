import { SendTxRequest } from "@project-serum/anchor/dist/cjs/provider";
import chalk from "chalk";
import { OracleQueueSchema } from "../accounts";

export async function turnCrank(schema: OracleQueueSchema): Promise<void> {
  if (!schema.crank) throw new Error("no crank defined in schema");
  const program = await schema._program;
  const queueAuthority = schema._authority.publicKey;
  const queueAccount = await schema.toAccount();
  const payoutWallet = await schema.getAuthorityTokenAccount();

  const crankAccount = await schema.crank.toAccount();
  try {
    const readyPubkeys = await crankAccount.peakNextReady(5);
    const txn: SendTxRequest = {
      tx: await crankAccount.popTxn({
        payoutWallet,
        queuePubkey: queueAccount.publicKey,
        queueAuthority,
        readyPubkeys,
      }),
      signers: [],
    };

    await program.provider.sendAll([txn]);
    console.log(chalk.green("Crank turned"));
    for await (const pubkey of readyPubkeys) {
      const aggregator = schema.findAggregatorByPublicKey(pubkey);
      if (aggregator) aggregator.print();
    }
  } catch (error) {
    console.log(chalk.red("Crank turn failed"), error);
  }
}
