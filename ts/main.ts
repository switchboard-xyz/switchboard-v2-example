import dotenv from "dotenv";
import { hideBin } from "yargs/helpers";
import Yargs from "yargs/yargs";
import { fullExample } from "./actions/full-example";
import { createAggregator } from "./actions/public-queue/create-aggregator";
dotenv.config();

async function main(): Promise<void> {
  const argv = Yargs(hideBin(process.argv))
    .command(
      `create-new-aggregator [aggregatorDefinition] [crankKey] [authorityKeypair]`,
      "create a new aggregator account",
      (yargs) => {
        yargs.positional("aggregatorDefinition", {
          type: "string",
          describe: "filesystem path of aggeregator definition file",
          demand: true,
        });
        yargs.positional("crankKey", {
          type: "string",
          describe: "public key of the crank to add queue",
          demand: true,
        });
        yargs.positional("authorityKeypair", {
          type: "string",
          describe: "filesystem path of authority keypair",
          default: "keypairs/authority-keypair.json",
          demand: false,
        });
      }
    )
    .command(
      `create-new-queue [queueDefinition] [authorityKeypair]`,
      "create a new oracle queue",
      (yargs) => {
        yargs.positional("queueDefinition", {
          type: "string",
          describe: "filesystem path of oracle queue definition file",
          demand: true,
        });
        yargs.positional("authorityKeypair", {
          type: "string",
          describe: "filesystem path of authority keypair",
          default: "keypairs/authority-keypair.json",
          demand: false,
        });
      }
    )
    .command(
      `full-example [authorityKeypair]`,
      "spin up a new queue, oracle, crank, and aggregator",
      (yargs) => {
        yargs.positional("authorityKeypair", {
          type: "string",
          describe: "filesystem path of authority keypair",
          default: "keypairs/authority-keypair.json",
        });
      }
    )
    .parseSync();

  switch (argv._[0]) {
    case "full-example":
      await fullExample(argv);
      break;
    case "create-new-aggregator":
      await createAggregator(argv);
      break;
    default:
      console.log("not implemented");
  }
}
main().then(
  () => {
    console.log("exiting");
  },
  (error) => {
    console.error(error);
    return;
  }
);

export {};
