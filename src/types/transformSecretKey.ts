/**
 * Not working
 */
import { Transform } from "class-transformer";

export function TransformSecretKey() {
  const toPlain = Transform((value) => `[${value.value}]`, {
    toPlainOnly: true,
  });

  const toClass = Transform(
    (value) => new Uint8Array(JSON.parse(value.value as string)),
    {
      toClassOnly: true,
    }
  );

  return function (target: any, key: string) {
    toPlain(target, key);
    toClass(target, key);
  };
}
