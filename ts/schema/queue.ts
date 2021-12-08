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
import readLineSync from "readline-sync";
import {
  ParsedQueueSchema,
  pubKeyConverter,
  pubKeyReviver,
  QueueSchema,
} from ".";
import { findProjectRoot } from "../utils";

export const saveQueueSchema = (
  queueSchema: QueueSchema,
  outFile: string,
  force = false
): void => {
  const fullPath = path.join(findProjectRoot(), outFile);
  if (fs.existsSync(fullPath)) {
    if (force) {
      console.log(`Oracle Queue Schema: already existed, skipping ${fullPath}`);
    }
    console.log(fullPath);
    if (readLineSync.keyInYN("Do you want to overwrite this file?")) {
      fs.writeFileSync(
        fullPath,
        JSON.stringify(queueSchema, pubKeyConverter, 2)
      );
      console.log(`Oracle Queue Schema: saved to ${chalk.green(fullPath)}`);
      return;
    } else {
      return;
    }
  }
};

export const loadQueueSchema = (
  schemaPath: string
): QueueSchema | undefined => {
  const fullPath = path.join(findProjectRoot(), schemaPath);
  try {
    const schemaString = fs.readFileSync(fullPath, "utf8");
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
