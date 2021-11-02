import { plainToClass } from "class-transformer";
import fs from "node:fs";
import { IOracleQueueDefinition, OracleQueueDefinition } from "../accounts";

// load queue schema from file if exist
export const loadDefinition = (): OracleQueueDefinition | undefined => {
  const definitionFile = "oracleQueue.definition.json";
  if (fs.existsSync(definitionFile)) {
    const fileBuffer = fs.readFileSync(definitionFile);
    const definition: IOracleQueueDefinition = JSON.parse(
      fileBuffer.toString()
    );
    return plainToClass(OracleQueueDefinition, definition, {
      excludePrefixes: ["_"],
      excludeExtraneousValues: true,
    });
  }
};
