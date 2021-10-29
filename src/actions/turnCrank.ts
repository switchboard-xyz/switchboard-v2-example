import { OracleQueueSchema } from "../accounts";
import { selectCrank } from "../utils/cli/selectCrank";

export async function turnCrank(schema: OracleQueueSchema): Promise<void> {
  if (!schema.cranks) throw new Error("no cranks defined in schema");
  const crankSchema = await selectCrank(schema.cranks);
  const queueAccount = await schema.toAccount();
  const payer = await schema.getAuthorityTokenAccount();

  await crankSchema.turnCrank(queueAccount, payer);
}
