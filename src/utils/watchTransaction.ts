import { RPC_URL } from "../main";
import { Connection, Context, SignatureResult } from "@solana/web3.js";

export async function watchTransaction(txn: string): Promise<void> {
  const connection = new Connection(RPC_URL, {
    commitment: "confirmed",
  });
  async function signatureCallback(
    signatureResult: SignatureResult,
    context: Context
  ) {
    console.log(JSON.stringify(signatureResult, null, 2));
  }

  connection.onSignature(txn, signatureCallback);
}
