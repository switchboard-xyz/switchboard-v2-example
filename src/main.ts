/**
 * Entry point to the program with CLI options to perform various tasks
 * - Create jobs & feeds from json input file 
 *

 */

async function main(): Promise<void> {
  console.log("Hello World!");
  return;
}

main().then(
  () => {
    process.exit();
  },
  (err) => {
    console.error(err);
    process.exit(-1);
  }
);

export {};
