import prompts from "prompts";
import { toCluster } from "../toCluster";
import { Cluster } from "@solana/web3.js";

export async function selectCluster(): Promise<Cluster> {
  const answer = await prompts([
    {
      type: "select",
      name: "cluster",
      message: "Pick a cluster",
      choices: [
        {
          title: "Devnet",
          value: "devnet",
        },
        {
          title: "Mainnet-Beta",
          value: "mainnet-beta",
        },
        {
          title: "Localnet",
          value: "localnet",
        },
      ],
    },
  ]);
  return toCluster(answer.cluster);
}
