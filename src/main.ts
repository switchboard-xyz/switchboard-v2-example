/**
 * This will be the CLI entry point where user will be given the options:
 * 1. Run wizard (Create oracle, queues, load feeds)
 * 2. Oracle Heartbeat
 * 3. Turn Crank
 * 4. Read last result from a feed
 * 5. Print accounts? (look at account structures, queues > oracles/cranks/feeds)
 */
async function main(): Promise<void> {
  console.log("Hello World");
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
