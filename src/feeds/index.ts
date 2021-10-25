import { FeedDefinition } from "../types";
import { getBtcUsd } from "./btcUsd";
import { getEthUsd } from "./ethUsd";
import { getSolUsd } from "./solUsd";
import { getUsdtUsd } from "./usdtUsd";

export async function getAllFeeds(): Promise<FeedDefinition[]> {
  const feeds: FeedDefinition[] = [];
  // feeds.push(await getUsdtUsd());
  feeds.push(await getSolUsd());
  feeds.push(await getBtcUsd());
  feeds.push(await getEthUsd());
  return feeds;
}
