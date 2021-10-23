import { SOL_USD } from "./solUsd";
import { USDT_USD } from "./usdtusd";
import { BTC_USD } from "./btcUsd";
import { ETH_USD } from "./ethUsd";
import { FeedDefinition } from "../types";

export const ALL_FEEDS: FeedDefinition[] = [
  USDT_USD,
  SOL_USD,
  BTC_USD,
  ETH_USD,
];
