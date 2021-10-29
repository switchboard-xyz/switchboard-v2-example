import chalk from "chalk";
import { plainToClass } from "class-transformer";
import dotenv from "dotenv";
import fs from "node:fs";
import prompts from "prompts";
import "reflect-metadata"; // need global
import { OracleQueueDefinition, OracleQueueSchema } from "./accounts";
import {
  aggregatorResult,
  aggregatorUpdate,
  oracleHeartbeat,
  readCrank,
  turnCrank,
} from "./actions";
import { sleep } from "./utils";
dotenv.config();

async function main(): Promise<void> {
  let queueDefinition: OracleQueueDefinition | undefined;
  const inFile = "oracleQueue.definition.json";
  try {
    const fileBuffer = fs.readFileSync(inFile);
    const definition = JSON.parse(fileBuffer.toString());
    queueDefinition = plainToClass(OracleQueueDefinition, definition, {
      excludePrefixes: ["_"],
      excludeExtraneousValues: true,
    });
  } catch (error) {
    console.error(error);
    return;
  }
  if (!queueDefinition) {
    console.error("failed to read queue definition file", inFile);
    return;
  }

  // check if output file exists
  const outFile = "oracleQueue.schema.json";
  let queueSchema: OracleQueueSchema | undefined;
  if (fs.existsSync(outFile)) {
    console.log(chalk.green("Oracle Queue built from local schema:"), outFile);
    const fileBuffer = fs.readFileSync(outFile);
    queueSchema = JSON.parse(fileBuffer.toString());
  } else {
    queueSchema = await queueDefinition.toSchema();
  }
  if (!queueSchema || !queueSchema.name)
    throw new Error(`failed to parse schema input`);

  const queueSchemaClass = plainToClass(OracleQueueSchema, queueSchema, {
    excludePrefixes: ["_"],
    excludeExtraneousValues: true,
  });
  await queueSchemaClass.loadDefinition(queueDefinition);
  queueSchemaClass.saveJson(outFile);

  await sleep(2000); // delayed txn errors might ruin prompt

  let exit = false;
  while (!exit) {
    console.log("");
    const answer = await prompts([
      {
        type: "select",
        name: "action",
        message: "what do you want to do?",
        choices: [
          {
            title: "Read Oracles",
            value: "printOracles",
          },
          {
            title: "Oracle Heartbeat",
            value: "oracleHeartbeat",
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
            title: "Fund Authority Token Account",
            value: "fundAuthorityTokens",
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
      case "fundAuthorityTokens":
        await queueSchemaClass.fundTokens();
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
