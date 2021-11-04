import chalk from "chalk";
import { selectFeed } from "../../utils";
import { OracleQueueSchema } from "../accounts";

export async function aggregatorResult(
  schema: OracleQueueSchema
): Promise<void> {
  if (!schema.feeds) throw new Error("no feeds defined in schema");
  const aggregator = await selectFeed(schema.feeds);
  try {
    await aggregator.printLatestResult();
  } catch (error) {
    console.log(chalk.red("no result"), error);
  }
}
