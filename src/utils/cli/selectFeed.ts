import prompts, { Choice } from "prompts";
import { ALL_FEEDS } from "../../feed";

export async function selectCluster(): Promise<string[]> {
  const choices: Choice[] = ALL_FEEDS.map((f) => ({
    title: f.name.toString(),
    value: f.name.toString(),
  }));
  const answer = await prompts([
    {
      type: "multiselect",
      name: "datafeed",
      message: "Pick data feeds",
      choices,
    },
  ]);
  return answer.datafeed;
}
