/**
 * Input: "[00 00 00 ... ]"
 * Output: Uint8Array [00 00 00 ... ]
 */
export function unwrapSecretKey(secretKey: string): Uint8Array {
  return new Uint8Array(JSON.parse(secretKey));
}
