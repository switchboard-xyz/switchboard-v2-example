import * as anchor from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import { OracleJob } from "@switchboard-xyz/switchboard-api";
import {
  AggregatorAccount,
  JobAccount,
  LeaseAccount,
  OracleQueueAccount,
  PermissionAccount,
  ProgramStateAccount,
  programWallet,
} from "@switchboard-xyz/switchboard-v2";
import chalk from "chalk";
import fs from "fs";
import path from "path";
import readLineSync from "readline-sync";
import { AggregatorSchema, JobSchema, pubKeyConverter, pubKeyReviver } from ".";
import {
  CHECK_ICON,
  FAILED_ICON,
  toAccountString,
  toPermissionString,
  toUtf8,
} from "../utils";
import { findProjectRoot } from "../utils/findProjectRoot";

export const saveAggregatorSchema = (
  aggregatorSchema: AggregatorSchema,
  outFile: string,
  force = false
): void => {
  const fullPath = path.join(findProjectRoot(), outFile);

  if (!force && fs.existsSync(fullPath)) {
    console.log(fullPath);
    if (!readLineSync.keyInYN("Do you want to overwrite this file?")) {
      console.log(
        `${FAILED_ICON} Aggregator Schema: already existed, skipping ${fullPath}`
      );
      return;
    }
  }
  fs.writeFileSync(
    fullPath,
    JSON.stringify(aggregatorSchema, pubKeyConverter, 2)
  );
  console.log(
    `${CHECK_ICON} Aggregator Schema: saved to ${chalk.green(fullPath)}`
  );
};

export const loadAggregatorDefinition = (
  inputFile: string
): AggregatorSchema | undefined => {
  const fullInputFilePath = path.join(findProjectRoot(), inputFile);
  if (!fs.existsSync(fullInputFilePath))
    throw new Error(`input file does not exist ${fullInputFilePath}`);

  try {
    const definitionString = fs.readFileSync(fullInputFilePath, "utf8");
    const definition: AggregatorSchema = JSON.parse(
      definitionString,
      pubKeyReviver
    );
    return definition;
  } catch {
    return undefined;
  }
};

export async function createAggregatorFromDefinition(
  program: anchor.Program,
  definition: AggregatorSchema,
  queueAccount: OracleQueueAccount
): Promise<AggregatorSchema> {
  // Aggregator
  const feedName = definition.name;
  const {
    jobs,
    batchSize,
    minRequiredOracleResults,
    minRequiredJobResults,
    minUpdateDelaySeconds,
  } = definition;
  const aggregatorAccount = await AggregatorAccount.create(program, {
    name: Buffer.from(feedName),
    batchSize: batchSize || 1,
    minRequiredOracleResults: minRequiredOracleResults || 1,
    minRequiredJobResults: minRequiredJobResults || 1,
    minUpdateDelaySeconds: minUpdateDelaySeconds || 10,
    queueAccount: queueAccount,
    authority: programWallet(program).publicKey,
  });
  console.log(
    toAccountString(`Aggregator (${feedName})`, aggregatorAccount.publicKey)
  );
  if (!aggregatorAccount.publicKey)
    throw new Error(`failed to read Aggregator publicKey`);

  // Aggregator Permissions
  const aggregatorPermission = await PermissionAccount.create(program, {
    authority: programWallet(program).publicKey,
    granter: new PublicKey(queueAccount.publicKey),
    grantee: aggregatorAccount.publicKey,
  });
  console.log(toAccountString(`  Permission`, aggregatorPermission.publicKey));

  // Lease
  const [programStateAccount] = ProgramStateAccount.fromSeed(program);
  const switchTokenMint = await programStateAccount.getTokenMint();
  const tokenAccount = await switchTokenMint.getOrCreateAssociatedAccountInfo(
    programWallet(program).publicKey
  );
  const leaseContract = await LeaseAccount.create(program, {
    loadAmount: new anchor.BN(0),
    funder: tokenAccount.address,
    funderAuthority: programWallet(program),
    oracleQueueAccount: queueAccount,
    aggregatorAccount,
  });
  console.log(toAccountString(`  Lease`, leaseContract.publicKey));

  // Jobs
  const jobSchemas: JobSchema[] = [];
  for await (const job of jobs) {
    const { name, tasks } = job;
    const jobData = Buffer.from(
      OracleJob.encodeDelimited(
        OracleJob.create({
          tasks,
        })
      ).finish()
    );
    const jobKeypair = anchor.web3.Keypair.generate();
    const jobAccount = await JobAccount.create(program, {
      data: jobData,
      keypair: jobKeypair,
      authority: programWallet(program).publicKey,
    });
    console.log(toAccountString(`  Job (${name})`, jobAccount.publicKey));
    await aggregatorAccount.addJob(jobAccount, programWallet(program)); // Add Job to Aggregator
    const jobSchema: JobSchema = {
      name,
      publicKey: jobAccount.publicKey,
      secretKey: jobKeypair.secretKey,
      tasks,
    };
    jobSchemas.push(jobSchema);
  }

  const aggregatorData = await aggregatorAccount.loadData();
  const permissionData = await aggregatorPermission.loadData();

  const newAggregatorDefinition: AggregatorSchema = {
    ...definition,
    name: toUtf8(aggregatorData.name),
    publicKey: aggregatorAccount.publicKey,
    batchSize: aggregatorData.batchSize,
    minRequiredOracleResults: aggregatorData.minRequiredOracleResults,
    minRequiredJobResults: aggregatorData.minRequiredJobResults,
    minUpdateDelaySeconds: aggregatorData.minUpdateDelaySeconds,
    permission: {
      publicKey: aggregatorPermission.publicKey,
      expiration: permissionData.expiration,
      queuePermission: toPermissionString(permissionData.permissions),
      granter: permissionData.granter,
      grantee: permissionData.grantee,
    },
    lease: {
      publicKey: leaseContract.publicKey,
    },
    jobs: jobSchemas,
  };
  return newAggregatorDefinition;
}
