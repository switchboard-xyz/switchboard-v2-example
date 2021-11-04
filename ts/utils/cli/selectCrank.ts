import prompts, { Choice } from "prompts";
import { CrankSchema } from "../../cli/accounts";

export async function selectCrank(cranks: CrankSchema[]): Promise<CrankSchema> {
  const choices: Choice[] = cranks.map((c) => ({
    title: c.name,
    value: c.name,
  }));
  const answer = await prompts([
    {
      type: "select",
      name: "crank",
      message: "Pick a crank",
      choices,
    },
  ]);
  const crank = cranks.find((c) => c.name === answer.crank);
  if (!crank) throw new Error(`failed to find ${answer.crank} in ${choices}`);
  return crank;
}
