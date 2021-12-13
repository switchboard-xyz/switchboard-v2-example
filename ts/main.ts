#!/usr/bin/env node
import dotenv from "dotenv";
import { hideBin } from "yargs/helpers";
import yargs from "yargs/yargs";
import {
  crankTurn,
  createPersonalAggregator,
  createPersonalQueue,
  createPublicAggregator,
  fullExample,
  readAnchorResult,
  updateAggregator,
} from "./actions";

dotenv.config();

async function main(): Promise<void> {
  const argv = yargs(hideBin(process.argv))
    .command(
      `full-example`,
      "spin up a new queue, oracle, crank, and aggregator",
      (yarg) => {},
      fullExample
    )
    .command(
      `create-aggregator [queueKey] [definitionFile] [outFile]`,
      "create a new aggregator account for a given queue",
      (yarg) => {
        yarg.positional("queueKey", {
          type: "string",
          describe:
            "public key of the oracle queue that the aggregator will belong to",
          demand: true,
        });
        yarg.positional("definitionFile", {
          type: "string",
          describe:
            "filesystem path of JSON file containing the aggregator definition",
          default: "sample.aggregator.json",
          demand: true,
        });
        yarg.positional("outFile", {
          type: "string",
          describe:
            "filesystem path to store the aggregator schema to quickly load and manage an aggregator",
          default: "secrets/schema.aggregator.json",
          demand: true,
        });
      },
      createPublicAggregator
    )
    .command(
      `create-personal-queue [queueDefinition] [outFile]`,
      "create a new oracle queue for which you are the authority for",
      (yarg) => {
        yarg.positional("queueDefinition", {
          type: "string",
          describe:
            "filesystem path of JSON file containing the oracle queue definition",
          default: "sample.definition.queue.json",
          demand: true,
        });
        yarg.positional("outFile", {
          type: "string",
          describe:
            "filesystem path to store the oracle queue schema to quickly load and manage a queue",
          demand: true,
        });
      },
      createPersonalQueue
    )
    .command(
      `create-personal-aggregator [queueSchemaFile] [aggregatorDefinition]`,
      "create a new aggregator on your personal queue",
      (yarg) => {
        yarg.positional("queueSchemaFile", {
          yarg: "string",
          describe:
            "filesystem path of oracle queue schema file to load accounts from",
          demand: true,
        });
        yarg.positional("aggregatorDefinition", {
          type: "string",
          describe:
            "filesystem path of JSON file containing the aggregator definition",
          default: "sample.definition.aggregator.json",
          demand: true,
        });
        yarg.positional("crankName", {
          type: "string",
          describe:
            "the name of the crank to add aggregator to. If not provided, aggregator is added to the first crank",
          demand: false,
        });
      },
      createPersonalAggregator
    )
    .command(
      `update-aggregator [aggregatorKey]`,
      "request a new update round for a given aggregator",
      (yarg) => {
        yarg.positional("aggregatorKey", {
          yarg: "string",
          describe:
            "public key of the aggregator account to request an update from",
          demand: true,
        });
      },
      updateAggregator
    )
    .command(
      `crank-turn [crankKey]`,
      "turn the crank",
      (yarg) => {
        yarg.positional("crankKey", {
          yarg: "string",
          describe: "public key of the crank to turn",
          demand: true,
        });
      },
      crankTurn
    )
    .command(
      `read-anchor [aggregatorKey]`,
      "read the aggregator result from the deployed anchor program",
      (yarg) => {
        yarg.positional("aggregatorKey", {
          yarg: "string",
          describe:
            "public key of the aggregator account to read latest result from",
          demand: true,
        });
      },
      readAnchorResult
    )
    .options({
      authorityKeypair: {
        type: "string",
        describe: "filesystem path of authority keypair",
        default: "secrets/authority-keypair.json",
        demand: false,
      },
      force: {
        type: "boolean",
        alias: "f",
        describe: "overwrite any existing files",
        default: false,
        demand: false,
      },
    })
    .example("$0 full-example", "test")
    .parse();
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
