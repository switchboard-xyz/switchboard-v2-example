import chalk from "chalk";
import { plainToClass } from "class-transformer";
import fs from "node:fs";
import { OracleQueueSchema } from "../accounts";

// load queue schema from file if exist
export const loadSchema = (): OracleQueueSchema | undefined => {
  const outFile = "oracleQueue.schema.json";
  if (fs.existsSync(outFile)) {
    console.log(chalk.green("Oracle Queue built from local schema:"), outFile);
    const fileBuffer = fs.readFileSync(outFile);
    const queueSchema: OracleQueueSchema = JSON.parse(fileBuffer.toString());
    const queueSchemaClass = plainToClass(OracleQueueSchema, queueSchema, {
      excludePrefixes: ["_"],
      excludeExtraneousValues: true,
    });
    return queueSchemaClass;
  }
};
