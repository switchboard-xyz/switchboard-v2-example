import { OracleQueueDefinition, OracleQueueSchema, OracleQueue } from "./types";
import fs from "fs";
import prompts from "prompts";
import chalk from "chalk";
import dotenv from "dotenv";
import { loadAnchorSync } from "./anchor";
import { popCrank } from "./actions/popCrank";
import { readCrank } from "./actions/readCrank";
import { TypedJSON } from "typedjson";
// import DEFINITIONS from "../oracleQueue.definition.json";
import "reflect-metadata";
dotenv.config();

export const RPC_URL = process.env.RPC_URL
  ? process.env.RPC_URL
  : "https://api.devnet.solana.com";

export const KEYPAIR_OUTPUT = process.env.KEYPAIR_OUTPUT
  ? `keypairs-${process.env.KEYPAIR_OUTPUT}` // use prefix for gitignore glob pattern
  : "."; // root

async function main(): Promise<void> {
  let queueDefinition: OracleQueueDefinition | undefined;
  try {
    const fileBuffer = fs.readFileSync("oracleQueue.definition.json");
    const fileString = fileBuffer.toString();
    queueDefinition = TypedJSON.parse(fileString, OracleQueueDefinition);
    console.log("q", queueDefinition);
  } catch (err) {
    console.error(err);
    process.exit(-1);
    return;
  }
  if (!queueDefinition) {
    console.error("no queue");
    return;
  }

  // check if output file exists
  const outFile = "src/oracleQueue.schema.json";
  const fullOutFile = `${outFile}`;
  let queueSchemaDefinition: OracleQueueSchema;
  if (fs.existsSync(fullOutFile)) {
    const fileBuffer = fs.readFileSync(fullOutFile);
    queueSchemaDefinition = JSON.parse(fileBuffer.toString());
    console.log(
      chalk.green("Oracle Queue built from local schema:"),
      fullOutFile
    );
  } else {
    const oracleQueue = new OracleQueue(queueDefinition);
    queueSchemaDefinition = await oracleQueue.createSchema();
    fs.writeFileSync(
      fullOutFile,
      JSON.stringify(queueSchemaDefinition, null, 2)
    );
    console.log(chalk.green("Oracle Queue schema built"), fullOutFile);
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
  const program = loadAnchorSync();
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
