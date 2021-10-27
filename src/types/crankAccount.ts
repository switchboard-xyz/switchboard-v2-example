import * as anchor from "@project-serum/anchor";
import "reflect-metadata";
import {
  jsonObject,
  jsonMember,
  jsonArrayMember,
  TypedJSON,
  toJson,
} from "typedjson";
import { keypair } from "./";

@toJson
@jsonObject
export class CrankDefinition {
  @jsonMember
  public name!: string;
  @jsonMember
  public maxRows!: number;
}

@jsonObject
export class CrankSchema extends CrankDefinition {
  @jsonMember
  public keypair!: keypair;
}
export {};
