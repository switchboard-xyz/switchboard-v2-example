import * as anchor from "@project-serum/anchor";
import { Keypair } from "@solana/web3.js";
import {
  CrankAccount,
  OracleAccount,
  OracleQueueAccount,
} from "@switchboard-xyz/switchboard-v2";
import chalk from "chalk";
import fs from "node:fs";
import path from "node:path";
import {
  ParsedQueueSchema,
  pubKeyConverter,
  pubKeyReviver,
  QueueSchema,
} from ".";
import { findProjectRoot } from "../utils";

export const QUEUE_SCHEMA_PATH = path.join(
  findProjectRoot(),
  "accounts/schema.oracle-queue.json"
);

export const saveQueueSchema = (queueSchema: QueueSchema): void => {
  fs.writeFileSync(
    QUEUE_SCHEMA_PATH,
    JSON.stringify(queueSchema, pubKeyConverter, 2)
  );
  console.log(
    `Oracle Queue Schema: saved to ${chalk.green(QUEUE_SCHEMA_PATH)}`
  );
  return;
};

export const loadQueueSchema = (): QueueSchema | undefined => {
  try {
    const schemaString = fs.readFileSync(QUEUE_SCHEMA_PATH, "utf8");
    const queue: QueueSchema = JSON.parse(schemaString, pubKeyReviver);
    return queue;
  } catch {
    return undefined;
  }
};

export const parseQueueSchema = (
  program: anchor.Program,
  schema: QueueSchema
): ParsedQueueSchema => {
  if (schema.queue.secretKey === undefined) {
    throw new Error(`need queue secret key to parse accounts`);
  }
  const account = new OracleQueueAccount({
    program,
    publicKey: schema.queue.publicKey,
  });
  // const authoritySecret = new Uint8Array(
  //   JSON.parse(schema.queue.secretKey as unknown as string)
  // );
  const authority = Keypair.fromSecretKey(schema.queue.secretKey);
  const cranks: CrankAccount[] = schema.cranks.map(
    (c) => new CrankAccount({ program, publicKey: c.publicKey })
  );
  const oracles: OracleAccount[] = schema.oracles.map(
    (o) => new OracleAccount({ program, publicKey: o.publicKey })
  );
  return { account, authority, cranks, oracles };
};
