/**
 * Not working
 */
import { Transform } from "class-transformer";

export default function TransformSecretKey() {
  const toPlain = Transform((value) => `[${value.value}]`, {
    toPlainOnly: true,
  });

  const toClass = Transform(
    (value) => new Uint8Array(JSON.parse(value.value)),
    {
      toClassOnly: true,
    }
  );

  return function (target: any, key: string) {
    toPlain(target, key);
    toClass(target, key);
  };
}
