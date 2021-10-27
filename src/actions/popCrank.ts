import * as anchor from "@project-serum/anchor";
import { CrankAccount } from "@switchboard-xyz/switchboard-v2";
import { OracleQueueSchema } from "../accounts";
import { selectCrank } from "../utils/cli/selectCrank";
import { RPC_URL } from "../main";
import {
  Connection,
  Context,
  SignatureResult,
  PublicKey,
} from "@solana/web3.js";

export async function popCrank(schema: OracleQueueSchema): Promise<void> {
  if (!schema.cranks) throw new Error("no cranks defined in schema");
  const crank: CrankAccount = await selectCrank(schema.cranks);
  const txn = await crank.pop({
    payoutWallet: crank.program.provider.wallet.publicKey,
    queuePubkey: new PublicKey(schema.publicKey),
    queueAuthority: crank.program.provider.wallet.publicKey,
  });
  console.log(txn);
  const connection = new Connection(RPC_URL, {
    commitment: "confirmed",
  });
  await watchTransaction(connection, txn);
}

export async function watchTransaction(connection: Connection, txn: string) {
  async function signatureCallback(
    signatureResult: SignatureResult,
    context: Context
  ) {
    console.log(JSON.stringify(signatureResult, null, 2));
  }

  connection.onSignature(txn, signatureCallback);
}
