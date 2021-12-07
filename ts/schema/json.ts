import { PublicKey } from "@solana/web3.js";

export const pubKeyConverter = (key: any, value: any): any => {
  if (value instanceof PublicKey) {
    return value.toString();
  }
  if (value instanceof Uint8Array) {
    return `[${value.toString()}]`;
  }
  return value;
};

export const pubKeyReviver = (key, value): any => {
  if (key === "publicKey") {
    return new PublicKey(value);
  }
  if (key === "secretKey") {
    return new Uint8Array(JSON.parse(value));
  }
  return value;
};
