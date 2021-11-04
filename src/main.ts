import dotenv from "dotenv";
import "reflect-metadata"; // need global
import { hideBin } from "yargs/helpers";
import Yargs from "yargs/yargs";
import { deployAction } from "./actions";
import { loadSchema } from "./schema";
import { QueueAction } from "./types";
import { sleep } from "./utils";
import { selectAction } from "./utils/cli/selectAction";
dotenv.config();

async function main(): Promise<void> {
  const argv = Yargs(hideBin(process.argv))
    .options({
      buildSchema: {
        type: "boolean",
        describe: "Exit after creating switchboard accounts",
        demand: false,
        default: false,
      },
      action: {
        type: "string",
        describe:
          "Action to perform after building schema (ListOracles, TurnCrank, UpdateAggregator)",
        demand: false,
        default: "",
      },
    })
    .parseSync();

  const queueSchemaClass = await loadSchema();
  if (argv.buildSchema) return;
  if (argv.action) {
    const maybeAction: QueueAction | undefined = QueueAction[argv.action];
    if (!maybeAction)
      throw new Error(`failed to find an action for ${argv.action}`);
    await deployAction(queueSchemaClass, maybeAction);
    return;
  }

  let exit = false;
  while (!exit) {
    await sleep(2000); // delayed txn errors might ruin prompt
    console.log("");
    const action = await selectAction();
    const actionResult = await deployAction(queueSchemaClass, action);
    if (actionResult === -1) exit = true;
  }
}

main().then(
  () => {
    return;
  },
  (error) => {
    console.error(error);
    return;
  }
);

export {};
