import { Keypair } from "@solana/web3.js";
import yargs from "yargs/yargs";
import fs from "fs";
import resolve from "resolve-dir";
import { readSecretKey } from "./utils";

export const getAuthorityKeypair = (): Keypair => {
  const fileName = "authority-keypair";
  const argv = yargs(process.argv.slice(2))
    .options({
      updateAuthorityKeypair: {
        type: "string",
        describe: "Path to keypair file that will pay for transactions.",
        demand: false, // should output console command to create keypair
      },
    })
    .parseSync();

  // read update authority from command line arguement
  if (argv.updateAuthorityKeypair) {
    const updateAuthorityBuffer = new Uint8Array(
      JSON.parse(fs.readFileSync(resolve(argv.updateAuthorityKeypair), "utf-8"))
    );
    const updateAuthority = Keypair.fromSecretKey(updateAuthorityBuffer);

    return updateAuthority;
  }

  // read update authority from local directory
  const updateAuthority = readSecretKey(fileName);
  if (!updateAuthority)
    throw new Error(
      "failed to read update authority from keypair directory or command line arguement"
    );

  return updateAuthority;
};
