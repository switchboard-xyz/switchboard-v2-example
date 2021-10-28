import { AggregatorAccount } from "@switchboard-xyz/switchboard-v2";
import prompts, { Choice } from "prompts";
import { AggregatorSchema } from "../../accounts";

export async function selectFeed(
  feeds: AggregatorSchema[]
): Promise<AggregatorAccount> {
  const choices: Choice[] = feeds.map((feed) => ({
    title: feed.name,
    value: feed.name,
  }));
  const answer = await prompts([
    {
      type: "select",
      name: "feed",
      message: "Pick a data feed",
      choices,
    },
  ]);
  const feed = feeds.find((f) => f.name === answer.feed);
  if (!feed) throw new Error(`failed to find ${answer.feed} in ${choices}`);
  return feed.toAccount();
}
