import { OracleQueueSchema } from "../accounts";

export async function turnCrank(schema: OracleQueueSchema): Promise<void> {
  if (!schema.crank) throw new Error("no crank defined in schema");
  // const crankSchema = await selectCrank(schema.cranks);
  const queueAccount = await schema.toAccount();
  const payer = await schema.getAuthorityTokenAccount();

  await schema.crank.turnCrank(queueAccount, payer);
}
