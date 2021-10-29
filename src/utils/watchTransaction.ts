import { Connection, SignatureResult } from "@solana/web3.js";
import { RPC_URL } from "../types";

async function signatureCallback(
  signatureResult: SignatureResult
  // _context: Context
) {
  console.log(JSON.stringify(signatureResult, undefined, 2));
}

export async function watchTransaction(txn: string): Promise<void> {
  console.log(`https://explorer.solana.com/tx/${txn}?cluster=devnet`);
  const connection = new Connection(RPC_URL, {
    commitment: "confirmed",
  });

  connection.onSignature(txn, signatureCallback);
}
