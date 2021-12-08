#!/usr/bin/env node
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
      `full-example`,
      "spin up a new queue, oracle, crank, and aggregator",
      (yargs) => {}
    )
    .command(
      `create-aggregator [queueKey] [definitionFile] [outFile]`,
      "create a new aggregator account for a given queue",
      (yargs) => {
        yargs.positional("queueKey", {
          type: "string",
          describe:
            "public key of the oracle queue that the aggregator will belong to",
          demand: true,
        });
        yargs.positional("definitionFile", {
          type: "string",
          describe:
            "filesystem path of JSON file containing the aggregator definition",
          default: "sample.aggregator.json",
          demand: true,
        });
        yargs.positional("outFile", {
          type: "string",
          describe:
            "filesystem path to store the aggregator schema to quickly load and manage an aggregator",
          default: "secrets/schema.aggregator.json",
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
          describe:
            "filesystem path of JSON file containing the oracle queue definition",
          default: "sample.definition.queue.json",
          demand: true,
        });
        yargs.positional("outFile", {
          type: "string",
          describe:
            "filesystem path to store the oracle queue schema to quickly load and manage a queue",
          demand: true,
        });
      }
    )
    .command(
      `create-personal-aggregator [queueSchemaFile] [aggregatorDefinition]`,
      "create a new aggregator on your own queue",
      (yargs) => {
        yargs.positional("queueSchemaFile", {
          type: "string",
          describe:
            "filesystem path of oracle queue schema file to load accounts from",
          demand: true,
        });
        yargs.positional("aggregatorDefinition", {
          type: "string",
          describe:
            "filesystem path of JSON file containing the aggregator definition",
          default: "sample.definition.aggregator.json",
          demand: true,
        });
      }
    )

    .options({
      authorityKeypair: {
        type: "string",
        describe: "filesystem path of authority keypair",
        default: "secrets/authority-keypair.json",
        demand: false,
      },
    })
    .example("$0 full-example", "test")
    .parseSync();

  switch (argv._[0]) {
    case "full-example":
      await fullExample(argv);
      break;
    case "create-aggregator":
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
