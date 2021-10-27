import * as anchor from "@project-serum/anchor";
import "reflect-metadata";
import {
  jsonObject,
  jsonMember,
  jsonArrayMember,
  TypedJSON,
  toJson,
} from "typedjson";
import { EndpointEnum, keypair, OracleDefiniton } from "./";

@toJson
@jsonObject
export class JobDefinition {
  @jsonMember
  public source!: EndpointEnum;
  @jsonMember
  public id!: string;
}

@jsonObject
export class JobSchema extends JobDefinition {
  @jsonMember
  public keypair!: keypair;
}
export {};
