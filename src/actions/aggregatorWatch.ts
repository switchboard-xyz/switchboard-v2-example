import * as anchor from "@project-serum/anchor";
import chalk from "chalk";
import { OracleQueueSchema } from "../accounts";
import { waitForever } from "../utils";

export async function aggregatorWatch(
  schema: OracleQueueSchema
): Promise<void> {
  if (!schema.feeds) throw new Error("no feeds defined in schema");
  const program = await schema._program;
  program.addEventListener(
    "AggregatorValueUpdateEvent",
    aggregatorUpdateCallback
  );
  await waitForever();
}

async function aggregatorUpdateCallback(event: any, slot: any) {
  const pubkey = event.feedPubkey.toString();
  const mantissa: anchor.BN = event.value.mantissa;
  const scale: number = event.value.scale;
  const scaleExp = Math.pow(10, -1 * scale);
  const value = mantissa.toNumber() * scaleExp;
  console.log(`${chalk.blue(value)} - ${chalk.yellow(pubkey)}`);
  //   console.log(event);
}
