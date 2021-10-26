import { OracleQueueDefinition, OracleQueueSchema } from "./types";
import fs from "fs";
import { OracleQueue } from "./accounts";

async function queueInit(): Promise<void> {
  const fileBuffer = fs.readFileSync("input.json");
  const queueDefinition: OracleQueueDefinition = JSON.parse(
    fileBuffer.toString()
  );

  // check if output file exists
  if (fs.existsSync("output.json")) return;

  const oracleQueue = new OracleQueue(queueDefinition);
  const oracleQueueSchema = await oracleQueue.create();
  console.log(oracleQueueSchema);
  // const oracleSchema = new OracleSchema(oracleQueueSchema);
  // console.log(oracleSchema
  fs.writeFileSync("output.json", JSON.stringify(oracleQueueSchema, null, 2));
  console.log("Typeof", typeof oracleQueueSchema);
  // console.log(oracleQueueSchema instanceof OracleQueueSchema);
}

queueInit().then(
  () => {
    process.exit();
  },
  (err) => {
    console.error(err);
    process.exit(-1);
  }
);

export {};
