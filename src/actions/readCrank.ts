import { CrankAccount } from "@switchboard-xyz/switchboard-v2";
import chalk from "chalk";
import { OracleQueueSchema } from "../accounts";
import { selectCrank } from "../utils/cli/selectCrank";

export async function readCrank(
  schema: OracleQueueSchema,
  number_ = 10
): Promise<void> {
  if (!schema.cranks) throw new Error("no cranks defined in schema");
  const crankAccount: CrankAccount = await selectCrank(schema.cranks);
  const aggregatorKeys = (await crankAccount.peakNextReady(number_)).map((c) =>
    c.toString()
  );

  // Find aggregator by public key
  for (const feed of schema.feeds) {
    for (const key of aggregatorKeys) {
      if (feed.publicKey == key)
        console.log(
          chalk.green("Update Ready:"),
          `${chalk.blue(feed.name.padEnd(10, " "))} ${chalk.yellow(key)}`
        );
    }
  }
}
