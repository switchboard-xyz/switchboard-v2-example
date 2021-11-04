import { OracleAccount } from "@switchboard-xyz/switchboard-v2";
import prompts, { Choice } from "prompts";
import { OracleSchema } from "../../cli/accounts";

export async function selectOracle(
  oracles: OracleSchema[]
): Promise<OracleAccount> {
  const choices: Choice[] = oracles.map((oracle) => ({
    title: oracle.name,
    value: oracle.name,
  }));
  const answer = await prompts([
    {
      type: "select",
      name: "oracle",
      message: "Pick an Oracle",
      choices,
    },
  ]);
  const oracle = oracles.find((o) => o.name === answer.oracle);
  if (!oracle) throw new Error(`failed to find ${answer.oracle} in ${choices}`);
  return oracle.toAccount();
}
