import "reflect-metadata"; // need global
import { OracleQueueDefinition, OracleQueueSchema } from "./accounts";
import { AnchorProgram } from "./program";
import fs from "fs";
import prompts from "prompts";
import chalk from "chalk";
import dotenv from "dotenv";
import { popCrank } from "./actions/popCrank";
import { readCrank } from "./actions/readCrank";
import { TypedJSON } from "typedjson";
// import DEFINITIONS from "../oracleQueue.definition.json";

import { getAuthorityKeypair } from "./authority";
dotenv.config();

export const RPC_URL = process.env.RPC_URL
  ? process.env.RPC_URL
  : "https://api.devnet.solana.com";

export const KEYPAIR_OUTPUT = process.env.KEYPAIR_OUTPUT
  ? `keypairs-${process.env.KEYPAIR_OUTPUT}` // use prefix for gitignore glob pattern
  : "."; // root

async function main(): Promise<void> {
  const authority = getAuthorityKeypair();

  let queueDefinition: OracleQueueDefinition | undefined;
  try {
    const fileBuffer = fs.readFileSync("oracleQueue.definition.json");
    const fileString = fileBuffer.toString();
    queueDefinition = TypedJSON.parse(fileString, OracleQueueDefinition);
  } catch (err) {
    console.error(err);
    process.exit(-1);
  }
  if (!queueDefinition) {
    console.error("no queue");
    return;
  }

  // check if output file exists
  const outFile = "oracleQueue.schema.json";
  const fullOutFile = `${outFile}`;
  let queueSchemaDefinition: OracleQueueSchema | undefined;
  if (fs.existsSync(fullOutFile)) {
    console.log(
      chalk.green("Oracle Queue built from local schema:"),
      fullOutFile
    );
    const fileBuffer = fs.readFileSync(fullOutFile);
    const fileString = `${fileBuffer}`;
    queueSchemaDefinition = TypedJSON.parse(fileString, OracleQueueSchema);
  } else {
    queueSchemaDefinition = await queueDefinition.toSchema(authority);
  }
  if (!queueSchemaDefinition || !queueSchemaDefinition.name)
    throw new Error(`failed to parse schema input`);

  const schemaString = TypedJSON.stringify(
    queueSchemaDefinition,
    OracleQueueSchema
  );
  const schemaClass = TypedJSON.parse(schemaString, OracleQueueSchema);
  const newSchemaString = TypedJSON.stringify(schemaClass, OracleQueueSchema);
  console.log("Schema", newSchemaString);
  if (newSchemaString) {
    fs.writeFileSync(fullOutFile, newSchemaString);
  } else {
    throw new Error("failed to write json schema output");
  }

  const answer = await prompts([
    {
      type: "select",
      name: "action",
      message: "what do you want to do?",
      choices: [
        {
          title: "1. Verify Job Definitions",
          value: "verifyJobs",
        },
        {
          title: "2. Oracle Heartbeat",
          value: "oracleHeartbeat",
        },
        {
          title: "3. Request Aggregator Update",
          value: "aggregatorUpdate",
        },
        {
          title: "4. Read Aggregator Result",
          value: "aggregatorResult",
        },
        {
          title: "5. Turn the Crank",
          value: "crankTurn",
        },
        {
          title: "6. Read the Crank",
          value: "readCrank",
        },
      ],
    },
  ]);
  const program = AnchorProgram.getInstance().program;
  console.log("selected:", answer.action);
  switch (answer.action) {
    case "readCrank":
      await readCrank(program, queueSchemaDefinition);
      break;
    case "crankTurn":
      await popCrank(program, queueSchemaDefinition);
      break;
    case "aggregatorResult":
      console.log("Printing latest result");
      break;
    default:
      console.log("Not implemented yet");
  }
}

main().then(
  () => {
    process.exit();
  },
  (err) => {
    console.error(err);
    process.exit(-1);
  }
);

export {};
