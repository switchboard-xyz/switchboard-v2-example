import { OracleQueueSchema } from "./accounts";
import { aggregatorResult } from "./actions/aggregatorResult";
import { aggregatorUpdate } from "./actions/aggregatorUpdate";
import { aggregatorWatch } from "./actions/aggregatorWatch";
import { oracleHeartbeat } from "./actions/oracleHeartbeat";
import { readCrank } from "./actions/readCrank";
import { turnCrank } from "./actions/turnCrank";
import { watchCrank } from "./actions/watchCrank";
import { QueueAction } from "./types";
export * from "./actions/aggregatorResult";
export * from "./actions/aggregatorUpdate";
export * from "./actions/aggregatorWatch";
export * from "./actions/loadFeeds";
export * from "./actions/oracleHeartbeat";
export * from "./actions/readCrank";
export * from "./actions/turnCrank";
export * from "./actions/watchCrank";

/**
 * Matches the QueueAction enum to a helper function
 * Returns -1 when no action was taken
 */
export async function deployAction(
  queueSchemaClass: OracleQueueSchema,
  action: QueueAction
): Promise<number> {
  let result = 0;
  switch (action) {
    case QueueAction.ListOracles:
      await queueSchemaClass.printOracles();
      break;
    case QueueAction.ListAggregators:
      await queueSchemaClass.printFeeds();
      break;
    case QueueAction.WatchAggregator:
      await aggregatorWatch(queueSchemaClass);
      break;
    case QueueAction.OracleHeartbeat:
      await oracleHeartbeat(queueSchemaClass);
      break;
    case QueueAction.UpdateAggregator:
      await aggregatorUpdate(queueSchemaClass);
      break;
    case QueueAction.ReadAggregator:
      await aggregatorResult(queueSchemaClass);
      break;
    case QueueAction.ListCrank:
      await readCrank(queueSchemaClass);
      break;
    case QueueAction.TurnCrank:
      await turnCrank(queueSchemaClass);
      break;
    case QueueAction.WatchCrank:
      await watchCrank(queueSchemaClass);
      break;
    case undefined:
      console.log("User exited");
      result = -1;
      break;
    default:
      console.log("Not implemented yet");
      result = -1;
  }
  return result;
}
