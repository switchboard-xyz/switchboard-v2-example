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
  popCrank,
  readCrank,
} from "./actions";
import { AnchorProgram } from "./types/anchorProgram";
import { sleep } from "./utils";
dotenv.config();

async function main(): Promise<void> {
  const authority = AnchorProgram.getInstance().authority;

  let queueDefinition: OracleQueueDefinition | undefined;
  try {
    const fileBuffer = fs.readFileSync("oracleQueue.definition.json");
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
    console.error("no queue");
    return;
  }

  // check if output file exists
  const outFile = "oracleQueue.schema.json";
  const fullOutFile = `${outFile}`;
  let queueSchema: OracleQueueSchema | undefined;
  if (fs.existsSync(fullOutFile)) {
    console.log(
      chalk.green("Oracle Queue built from local schema:"),
      fullOutFile
    );
    const fileBuffer = fs.readFileSync(fullOutFile);
    queueSchema = JSON.parse(fileBuffer.toString());
  } else {
    queueSchema = await queueDefinition.toSchema(authority);
  }
  if (!queueSchema || !queueSchema.name)
    throw new Error(`failed to parse schema input`);

  const queueSchemaClass = plainToClass(OracleQueueSchema, queueSchema, {
    excludePrefixes: ["_"],
    excludeExtraneousValues: true,
  });
  await queueSchemaClass.loadDefinition(queueDefinition);
  queueSchemaClass.saveJson(fullOutFile);
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
            title: "1. Oracle Heartbeat",
            value: "oracleHeartbeat",
          },
          {
            title: "2. Request Aggregator Update",
            value: "aggregatorUpdate",
          },
          {
            title: "3. Read Aggregator Result",
            value: "aggregatorResult",
          },
          {
            title: "4. Turn the Crank",
            value: "crankTurn",
          },
          {
            title: "5. Read the Crank",
            value: "readCrank",
          },
        ],
      },
    ]);
    switch (answer.action) {
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
        await popCrank(queueSchemaClass, authority);
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
