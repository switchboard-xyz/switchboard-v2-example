import * as anchor from "@project-serum/anchor";
import { CrankAccount } from "@switchboard-xyz/switchboard-v2";
import prompts, { Choice } from "prompts";
import { CrankSchema } from "../../types";
import { loadCrankAccount } from "../loadAccounts";

export async function selectCrank(
  program: anchor.Program,
  cranks: CrankSchema[]
): Promise<CrankAccount> {
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
  const crankAccount = loadCrankAccount(program, crank);
  return crankAccount;
}
