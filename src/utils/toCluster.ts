import { Cluster } from "@solana/web3.js";
import { ConfigError } from "../types";

export function toCluster(cluster: string): Cluster {
  switch (cluster) {
    case "devnet":
    case "testnet":
    case "mainnet-beta": {
      return cluster;
    }
  }

  throw new ConfigError(
    `Invalid cluster ${cluster} [devnet / testnet / mainnet-beta]`
  );
}
