import * as anchor from "@project-serum/anchor";
import "reflect-metadata";
import {
  jsonObject,
  jsonMember,
  jsonArrayMember,
  toJson,
  TypedJSON,
} from "typedjson";
import { JobDefinition, JobSchema, keypair } from "./";

@toJson
@jsonObject
export class AggregatorDefinition {
  @jsonMember
  public name!: string;

  @jsonMember
  public batchSize!: number;

  @jsonMember
  public minRequiredOracleResults!: number;

  @jsonMember
  public minRequiredJobResults!: number;

  @jsonMember
  public minUpdateDelaySeconds!: number;

  @jsonArrayMember(String)
  public cranks!: string[];

  @jsonArrayMember(JobDefinition)
  public jobs!: JobDefinition[];
}

@jsonObject
export class AggregatorSchema extends AggregatorDefinition {
  @jsonMember
  keypair!: keypair;

  @jsonMember
  queuePermissionAccount!: string;

  @jsonMember
  leaseContract!: string;

  @jsonArrayMember(JobSchema)
  jobs!: JobSchema[];
}

export {};
