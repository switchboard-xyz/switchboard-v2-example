import * as anchor from "@project-serum/anchor";
import { Transform } from "class-transformer";

export default function TransformAnchorBN() {
  const toPlain = Transform((value) => (value.value as anchor.BN).toString(), {
    toPlainOnly: true,
  });

  const toClass = Transform((value) => new anchor.BN(value.value), {
    toClassOnly: true,
  });

  return function (target: any, key: string) {
    toPlain(target, key);
    toClass(target, key);
  };
}
