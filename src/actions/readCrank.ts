import { CrankAccount } from "@switchboard-xyz/switchboard-v2";
import chalk from "chalk";
import { OracleQueueSchema } from "../accounts";
import { selectCrank } from "../utils/cli/selectCrank";

export async function readCrank(
  schema: OracleQueueSchema,
  num = 10
): Promise<void> {
  if (!schema.cranks) throw new Error("no cranks defined in schema");
  const crankAccount: CrankAccount = await selectCrank(schema.cranks);
  const aggregatorKeys = (await crankAccount.peakNextReady(num)).map((c) =>
    c.toString()
  );

  // Find aggregator by public key
  schema.feeds.forEach((feed) => {
    aggregatorKeys.forEach((key) => {
      if (feed.publicKey == key)
        console.log(
          chalk.green("Update Ready:"),
          `${chalk.blue(feed.name.padEnd(10, " "))} ${chalk.yellow(key)}`
        );
    });
  });
}
