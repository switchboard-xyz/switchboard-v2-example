import dotenv from "dotenv";
import { hideBin } from "yargs/helpers";
import Yargs from "yargs/yargs";
import { fullExample } from "./actions/full-example";
import { createPersonalAggregator } from "./actions/personal-queue/create-aggregator";
import { createPersonalQueue } from "./actions/personal-queue/create-queue";
import { createPublicAggregator } from "./actions/public-queue/create-aggregator";
dotenv.config();

async function main(): Promise<void> {
  const argv = Yargs(hideBin(process.argv))
    .command(
      `create-public-aggregator [crankKey] [definitionFile] [outFile]`,
      "create a new aggregator account for a given crank",
      (yargs) => {
        yargs.positional("crankKey", {
          type: "string",
          describe: "public key of the crank to add queue",
          demand: true,
        });
        yargs.positional("definitionFile", {
          type: "string",
          describe: "filesystem path of aggeregator definition file",
          default: "accounts/sample.aggregator.json",
          demand: true,
        });
        yargs.positional("outFile", {
          type: "string",
          describe: "filesystem path to save the new accounts",
          default: "accounts/schema.aggregator.json",
          demand: true,
        });
      }
    )
    .command(
      `create-personal-queue [queueDefinition] [outFile]`,
      "create a new oracle queue",
      (yargs) => {
        yargs.positional("queueDefinition", {
          type: "string",
          describe: "filesystem path of oracle queue definition file",
          default: "accounts/sample.queue.json",
          demand: true,
        });
        yargs.positional("outFile", {
          type: "string",
          describe: "filesystem path to save the new accounts",
          default: "accounts/schema.queue.json",
          demand: true,
        });
      }
    )
    .command(
      `create-personal-aggregator [queueSchemaFile]`,
      "create a new aggregator on your own queue",
      (yargs) => {
        yargs.positional("queueSchemaFile", {
          type: "string",
          describe: "filesystem path of oracle queue schema file",
          demand: true,
        });
      }
    )
    .command(
      `full-example`,
      "spin up a new queue, oracle, crank, and aggregator",
      (yargs) => {}
    )
    .options({
      authorityKeypair: {
        type: "string",
        describe: "filesystem path of authority keypair",
        default: "keypairs/authority-keypair.json",
        demand: false,
      },
    })
    .parseSync();

  switch (argv._[0]) {
    case "full-example":
      await fullExample(argv);
      break;
    case "create-public-aggregator":
      await createPublicAggregator(argv);
      break;
    case "create-personal-aggregator":
      await createPersonalAggregator(argv);
      break;
    case "create-personal-queue":
      await createPersonalQueue(argv);
      break;
    default:
      console.log("not implemented");
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
