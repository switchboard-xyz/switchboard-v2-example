import { OracleQueueSchema } from "../accounts";
import { turnCrank } from "./turnCrank";

export async function watchCrank(schema: OracleQueueSchema): Promise<void> {
  setInterval(() => turnCrank(schema), 15_000);
}
