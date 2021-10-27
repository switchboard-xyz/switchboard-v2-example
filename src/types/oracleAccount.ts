import * as anchor from "@project-serum/anchor";
import "reflect-metadata";
import {
  jsonObject,
  jsonMember,
  jsonArrayMember,
  TypedJSON,
  toJson,
} from "typedjson";

@toJson
@jsonObject
export class OracleDefiniton {
  @jsonMember
  public name!: string;
}

@jsonObject
export class OracleSchema extends OracleDefiniton {
  @jsonMember
  public publicKey!: string;
  @jsonMember
  public queuePermissionAccount!: string;
}
export {};
