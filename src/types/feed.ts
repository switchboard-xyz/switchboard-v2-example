import { OracleJob } from "@switchboard-xyz/switchboard-api";

export interface FeedDefinition {
  name: Buffer;
  batchSize: number;
  minRequiredOracleResults: number;
  minRequiredJobResults: number;
  minUpdateDelaySeconds: number;
  jobs: OracleJob.Task[][];
}
