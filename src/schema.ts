import chalk from "chalk";
import { plainToClass } from "class-transformer";
import dotenv from "dotenv";
import fs from "node:fs";
import "reflect-metadata"; // need global
import {
  IOracleQueueDefinition,
  OracleQueueDefinition,
  OracleQueueSchema,
} from "./accounts";
import { AnchorProgram } from "./types";
import { findProjectRoot } from "./utils";
dotenv.config();

// load queue schema from file if exist
const loadDefinition = (): OracleQueueDefinition | undefined => {
  const definitionPath = findProjectRoot() + "oracleQueue.definition.json";
  if (fs.existsSync(definitionPath)) {
    const fileBuffer = fs.readFileSync(definitionPath);
    const definition: IOracleQueueDefinition = JSON.parse(
      fileBuffer.toString()
    );
    return plainToClass(OracleQueueDefinition, definition, {
      excludePrefixes: ["_"],
      excludeExtraneousValues: true,
    });
  }
};

export async function loadSchema(): Promise<OracleQueueSchema> {
  // load queue schema from file if exist
  let queueSchemaClass: OracleQueueSchema | undefined;
  const schemaPath = findProjectRoot() + "oracleQueue.schema.json";

  if (fs.existsSync(schemaPath)) {
    console.log(
      chalk.green("Oracle Queue built from local schema:"),
      schemaPath
    );
    const fileBuffer = fs.readFileSync(schemaPath);
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

  const authority = AnchorProgram.getInstance().authority;
  if (queueSchemaClass.authority !== authority.publicKey.toString())
    throw new Error(
      `provided authority wallet does not match the schema, authority-keypair ${authority.publicKey.toString()} expected ${
        queueSchemaClass.authority
      }`
    );

  if (queueDefinition) await queueSchemaClass.loadDefinition(queueDefinition); // check for any changes to the definitions
  queueSchemaClass.saveJson();

  return queueSchemaClass;
}
