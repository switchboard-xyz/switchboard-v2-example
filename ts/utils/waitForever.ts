import { EventEmitter } from "node:events";
import { waitFor } from "wait-for-event";

export function waitForever(): Promise<void> {
  return waitFor("", new EventEmitter());
}
