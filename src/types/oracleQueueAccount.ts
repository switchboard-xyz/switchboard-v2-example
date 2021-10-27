import * as anchor from "@project-serum/anchor";
import "reflect-metadata";
import {
  jsonObject,
  jsonMember,
  jsonArrayMember,
  TypedJSON,
  toJson,
} from "typedjson";
import { EndpointEnum, keypair } from "./";
import { OracleDefiniton, OracleSchema } from "./oracleAccount";
import { AggregatorDefinition, AggregatorSchema } from "./aggregatorAccount";
import { CrankDefinition, CrankSchema } from "./crankAccount";

TypedJSON.mapType(anchor.BN, {
  deserializer: (json) => (json == null ? json : new anchor.BN(json)),
  serializer: (value) => (value == null ? value : value.toString()),
});

@toJson
@jsonObject
export class OracleQueueDefinition {
  @jsonMember
  public name!: string;
  @jsonMember
  public reward!: anchor.BN;
  @jsonMember
  public minStake!: anchor.BN;
  @jsonArrayMember(OracleDefiniton)
  public oracles!: OracleDefiniton[];
  @jsonArrayMember(CrankDefinition)
  public cranks!: CrankDefinition[];
  @jsonArrayMember(AggregatorDefinition)
  public feeds!: AggregatorDefinition[];
}

@jsonObject
export class OracleQueueSchema extends OracleQueueDefinition {
  @jsonMember
  public keypair!: keypair;
  @jsonMember
  public programStateAccount!: string;
  @jsonArrayMember(OracleSchema)
  public oracles!: OracleSchema[];
  @jsonArrayMember(CrankSchema)
  public cranks!: CrankSchema[];
  @jsonArrayMember(AggregatorSchema)
  public feeds!: AggregatorSchema[];
}
export {};
