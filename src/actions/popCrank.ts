import { OracleQueueSchema } from "../accounts";
import { selectCrank } from "../utils/cli/selectCrank";

export async function popCrank(schema: OracleQueueSchema): Promise<void> {
  if (!schema.cranks) throw new Error("no cranks defined in schema");
  const crankSchema = await selectCrank(schema.cranks);
  const payoutWallet = schema._program.provider.wallet.publicKey;
  const queueAccount = schema.toAccount();

  await crankSchema.turnCrank(queueAccount, payoutWallet);
}
