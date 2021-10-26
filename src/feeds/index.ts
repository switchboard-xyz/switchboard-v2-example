import { FeedDefinition } from "../types";
import { getBtcUsd } from "./btcUsd";
import { getEthUsd } from "./ethUsd";
import { getSolUsd } from "./solUsd";
import { getUsdtUsd } from "./usdtUsd";

export async function getAllFeeds(): Promise<FeedDefinition[]> {
  const feeds: FeedDefinition[] = [];
  const usdt = await getUsdtUsd();
  const sol = await getSolUsd();
  const btc = await getBtcUsd();
  const eth = await getEthUsd();
  feeds.push(await getUsdtUsd());
  feeds.push(await getSolUsd());
  feeds.push(await getBtcUsd());
  feeds.push(await getEthUsd());
  return [sol, btc, eth];
}
