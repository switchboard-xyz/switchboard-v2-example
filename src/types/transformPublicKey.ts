/**
 * Not working
 */
import { PublicKey } from "@solana/web3.js";
import { Transform } from "class-transformer";

export default function TransformPublicKey() {
  const toPlain = Transform((value) => (value.value as PublicKey).toString(), {
    toPlainOnly: true,
  });

  const toClass = Transform((value) => new PublicKey(value.value as string), {
    toClassOnly: true,
  });

  return function (target: any, key: string) {
    toPlain(target, key);
    toClass(target, key);
  };
}
