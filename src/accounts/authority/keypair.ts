import { Keypair } from "@solana/web3.js";
import { readSecretKey } from "../../utils/readSecretKey";
import yargs from "yargs/yargs";
import fs from "fs";
import resolve from "resolve-dir";
import { ConfigError } from "../../types";
import { toAccountString } from "../../utils/toAccountString";

export const getAuthorityKeypair = (): Keypair => {
  const fName = "authority-keypair";
  const argv = yargs(process.argv.slice(2))
    .options({
      updateAuthorityKeypair: {
        type: "string",
        describe: "Path to keypair file that will pay for transactions.",
        demand: false, // should output console command to create keypair
      },
    })
    .parseSync();
  // get update authority wallet

  if (argv.updateAuthorityKeypair) {
    const updateAuthorityBuffer = new Uint8Array(
      JSON.parse(fs.readFileSync(resolve(argv.updateAuthorityKeypair), "utf-8"))
    );
    const updateAuthority = Keypair.fromSecretKey(updateAuthorityBuffer);
    console.log(
      "Arg:".padEnd(8, " "),
      toAccountString(fName, updateAuthority.publicKey)
    );
    return updateAuthority;
  }
  const updateAuthority = readSecretKey(fName);
  if (!updateAuthority)
    throw new ConfigError(
      "no update authority provided, add the following file to your keypair directory 'authority-keypair.json' or provide the command line flag --updateAuthorityKeypair"
    );
  console.log(
    "Local:".padEnd(8, " "),
    toAccountString(fName, updateAuthority.publicKey)
  );

  return updateAuthority;
};
