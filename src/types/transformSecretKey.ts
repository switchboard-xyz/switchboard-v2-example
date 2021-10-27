/**
 * Not working
 */
import { PublicKey } from "@solana/web3.js";
import { Transform } from "class-transformer";

export default function TransformSecretKey() {
  const toPlain = Transform((value) => `[${value.value}]`, {
    toPlainOnly: true,
  });

  const toClass = Transform(
    (value) => {
      const parsed = JSON.parse(value.value);
      return new Uint8Array(parsed);
    },
    {
      toClassOnly: true,
    }
  );

  return function (target: any, key: string) {
    toPlain(target, key);
    toClass(target, key);
  };
}
