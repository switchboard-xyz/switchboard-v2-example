export enum QueueAction {
  // List available oracles belonging to an Oracle Queue
  ListOracles = "ListOracles",
  // List aggregators ready for update attached to the Crank
  ListCrank = "ListCrank",
  // List available aggregators
  ListAggregators = "ListAggregators",
  // Perform Oracle heartbeat
  OracleHeartbeat = "OracleHeartbeat",
  // Read an aggregators last result
  ReadAggregator = "ReadAggregator",
  // Request an update for a specific aggregator
  UpdateAggregator = "UpdateAggregator",
  // Watch the aggregators
  WatchAggregator = "WatchAggregator",
  // Turn the crank and update any available aggregators
  TurnCrank = "TurnCrank",
  // Watch the crank and update any available aggregators every 15 seconds
  WatchCrank = "WatchCrank",
}
