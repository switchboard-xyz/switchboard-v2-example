import { Keypair } from "@solana/web3.js";
import { readSecretKey } from "../../utils/readSecretKey";

export const getAuthorityKeypair = (): Keypair | null => {
  const fName = "authority-keypair";
  return readSecretKey(fName);
};
