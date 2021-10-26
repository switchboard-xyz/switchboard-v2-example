import { OracleQueue } from "./accounts";
import { OracleQueueDefinition, OracleQueueSchema } from "./types";
import fs from "fs";
import prompts from "prompts";

async function queueInit(): Promise<void> {
  const fileBuffer = fs.readFileSync("input.json");
  const queueDefinition: OracleQueueDefinition = JSON.parse(
    fileBuffer.toString()
  );

  // check if output file exists
  const outFile = "output.json";
  let queueSchemaDefinition: OracleQueueSchema;
  if (fs.existsSync(outFile)) {
    const fileBuffer = fs.readFileSync(outFile);
    queueSchemaDefinition = JSON.parse(fileBuffer.toString());
    console.log("Oracle Queue built from local schema");
  } else {
    const oracleQueue = new OracleQueue(queueDefinition);
    queueSchemaDefinition = await oracleQueue.create();
    fs.writeFileSync(
      "output.json",
      JSON.stringify(queueSchemaDefinition, null, 2)
    );
    console.log("Oracle Queue built");
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
  console.log("selected:", answer.action);
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
