import { Keypair } from "@solana/web3.js";
import fs from "node:fs";
import resolve from "resolve-dir";
import { hideBin } from "yargs/helpers";
import Yargs from "yargs/yargs";
import { findProjectRoot, toAccountString } from ".";

export const loadAuthorityKeypair = (): Keypair => {
  const argv = Yargs(hideBin(process.argv))
    .options({
      authorityKeypair: {
        type: "string",
        describe: "Path to keypair file that will pay for transactions.",
        demand: false, // should output console command to create keypair
      },
    })
    .parseSync();
  const authorityPath = findProjectRoot() + "keypairs/authority-keypair.json";

  // read update authority from command line arguement
  if (argv.authorityKeypair) {
    const authorityBuffer = new Uint8Array(
      JSON.parse(fs.readFileSync(resolve(argv.authorityKeypair), "utf-8"))
    );
    const authority = Keypair.fromSecretKey(authorityBuffer);
    console.log(
      toAccountString(
        `authority-${argv.authorityKeypair.replace(".json", "")}`,
        authority.publicKey.toString()
      )
    );
    return authority;
  }

  // read update authority from local directory
  const fileName = "authority-keypair";
  try {
    const keypairString = fs.readFileSync(authorityPath, "utf8");
    const keypairBuffer = new Uint8Array(JSON.parse(keypairString));
    const walletKeypair = Keypair.fromSecretKey(keypairBuffer);
    return walletKeypair;
  } catch {
    throw new Error(
      `failed to read update authority from keypair directory or command line arguement ./keypairs/${fileName}.json`
    );
  }
};
