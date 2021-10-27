import * as anchor from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import { TypedJSON } from "typedjson";

TypedJSON.mapType(anchor.BN, {
  deserializer: (json) => (json == null ? json : new anchor.BN(json)),
  serializer: (value) => (value == null ? value : value.toString()),
});

TypedJSON.mapType(PublicKey, {
  deserializer: (json) => (json == null ? json : new PublicKey(json)),
  serializer: (value) => (value == null ? value : value.toString()),
});

// TypedJSON.mapType(Uint8Array, {
//   deserializer: (json) => (json == null ? json : {}),
//   serializer: (value) => (value == null ? value : new Uint8Array(value)),
// });
