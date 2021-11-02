export enum QueueAction {
  // List available oracles belonging to an Oracle Queue
  ListOracles = "List_Oracles",
  // List aggregators ready for update attached to the Crank
  ListCrank = "List_Crank",
  // List available aggregators
  ListAggregators = "List_Aggregators",
  // Perform Oracle heartbeat
  OracleHeartbeat = "Oracle_Heartbeat",
  // Read an aggregators last result
  ReadAggregator = "Read_Aggregator",
  // Request an update for a specific aggregator
  UpdateAggregator = "Update_Aggregator",
  // Turn the crank and update any available aggregators
  TurnCrank = "Turn_Crank",
}
