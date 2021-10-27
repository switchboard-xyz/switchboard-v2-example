import "reflect-metadata"; // need global
import { OracleQueueDefinition, OracleQueueSchema } from "./accounts";
import { AnchorProgram } from "./program";
import fs from "fs";
import prompts from "prompts";
import chalk from "chalk";
import dotenv from "dotenv";
import { popCrank } from "./actions/popCrank";
import { readCrank } from "./actions/readCrank";
import { plainToClass, serialize, classToPlain } from "class-transformer";
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
    const definition = JSON.parse(fileBuffer.toString());
    queueDefinition = plainToClass(OracleQueueDefinition, definition, {
      excludePrefixes: ["_"],
      excludeExtraneousValues: true,
    });
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
  if (queueSchema) {
    const queueSchemaString = classToPlain(queueSchemaClass);
    console.log(JSON.stringify(queueSchemaString));
    fs.writeFileSync(fullOutFile, JSON.stringify(queueSchemaString));
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
      await readCrank(program, queueSchemaClass);
      break;
    case "crankTurn":
      await popCrank(program, queueSchemaClass);
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
