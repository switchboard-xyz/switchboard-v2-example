export function unwrapSecretKey(secretKey: string): Uint8Array {
  return new Uint8Array(JSON.parse(secretKey));
}
