import {
  aggregatorResult,
  aggregatorUpdate,
  oracleHeartbeat,
  readCrank,
  turnCrank,
} from ".";
import { OracleQueueSchema } from "../accounts";
import { QueueAction } from "../types";

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
