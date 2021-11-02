import { plainToClass } from "class-transformer";
import fs from "node:fs";
import { OracleQueueDefinition } from "../accounts";

// load queue schema from file if exist
export const loadDefinition = (): OracleQueueDefinition => {
  const definitionFile = "oracleQueue.definition.json";
  if (fs.existsSync(definitionFile)) {
    const fileBuffer = fs.readFileSync(definitionFile);
    const queueDefinition: OracleQueueDefinition = JSON.parse(
      fileBuffer.toString()
    );
    const queueDefinitionClass = plainToClass(
      OracleQueueDefinition,
      queueDefinition,
      {
        excludePrefixes: ["_"],
        excludeExtraneousValues: true,
      }
    );
    return queueDefinitionClass;
  }
  throw new Error(`no definition file provided ${definitionFile}`);
};
