import chalk from "chalk";
import { plainToClass } from "class-transformer";
import dotenv from "dotenv";
import fs from "node:fs";
import prompts from "prompts";
import "reflect-metadata"; // need global
import { hideBin } from "yargs/helpers";
import Yargs from "yargs/yargs";
import { OracleQueueSchema } from "./accounts";
import {
  aggregatorResult,
  aggregatorUpdate,
  oracleHeartbeat,
  readCrank,
  turnCrank,
} from "./actions";
import { loadDefinition, sleep } from "./utils";
dotenv.config();

export async function getSchema(): Promise<OracleQueueSchema> {
  // load queue schema from file if exist
  let queueSchemaClass: OracleQueueSchema | undefined;
  const schemaFile = "oracleQueue.schema.json";

  if (fs.existsSync(schemaFile)) {
    console.log(
      chalk.green("Oracle Queue built from local schema:"),
      schemaFile
    );
    const fileBuffer = fs.readFileSync(schemaFile);
    queueSchemaClass = plainToClass(
      OracleQueueSchema,
      JSON.parse(fileBuffer.toString()),
      {
        excludePrefixes: ["_"],
        excludeExtraneousValues: true,
      }
    );
  }

  const queueDefinition = loadDefinition();
  if (!queueSchemaClass) {
    if (!queueDefinition)
      throw new Error(
        `failed to provide definition file oracleQueue.definition.json`
      );
    queueSchemaClass = await queueDefinition.toSchema();
  }

  if (!queueSchemaClass || !queueSchemaClass.name)
    throw new Error(`failed to build schema`);
  if (queueDefinition) await queueSchemaClass.loadDefinition(queueDefinition); // check for any changes to the definitions
  queueSchemaClass.saveJson();

  return queueSchemaClass;
}

async function main(): Promise<void> {
  const argv = Yargs(hideBin(process.argv))
    .options({
      buildSchema: {
        type: "boolean",
        describe: "Exit after creating switchboard accounts",
        demand: false,
        default: false,
      },
      overwrite: {
        type: "boolean",
        describe: "Completely rebuild schema file with brand new accounts",
        demand: false,
        default: false,
      },
    })
    .parseSync();

  const queueSchemaClass = await getSchema();

  let exit = false;
  if (argv.buildSchema) exit = true;
  while (!exit) {
    await sleep(2000); // delayed txn errors might ruin prompt
    console.log("");
    const answer = await prompts([
      {
        type: "select",
        name: "action",
        message: "what do you want to do?",
        choices: [
          {
            title: "List Oracles",
            value: "printOracles",
          },
          {
            title: "Oracle Heartbeat",
            value: "oracleHeartbeat",
          },
          {
            title: "List Aggregators",
            value: "printAggregators",
          },
          {
            title: "Read Aggregator Result",
            value: "aggregatorResult",
          },
          {
            title: "Request Aggregator Update",
            value: "aggregatorUpdate",
          },
          {
            title: "Read the Crank",
            value: "readCrank",
          },
          {
            title: "Turn the Crank",
            value: "crankTurn",
          },
        ],
      },
    ]);
    switch (answer.action) {
      case "printOracles":
        await queueSchemaClass.printOracles();
        break;
      case "printAggregators":
        await queueSchemaClass.printFeeds();
        break;
      case "oracleHeartbeat":
        await oracleHeartbeat(queueSchemaClass);
        break;
      case "aggregatorUpdate":
        await aggregatorUpdate(queueSchemaClass);
        break;
      case "aggregatorResult":
        await aggregatorResult(queueSchemaClass);
        break;
      case "readCrank":
        await readCrank(queueSchemaClass);
        break;
      case "crankTurn":
        await turnCrank(queueSchemaClass);
        break;
      case undefined:
        console.log("User exited");
        exit = true;
        break;
      default:
        console.log("Not implemented yet");
        exit = true;
    }
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
