export enum QueueAction {
  // List available oracles belonging to an Oracle Queue
  List_Oracles = "listOracles",
  // List aggregators ready for update attached to the Crank
  List_Crank = "listCrank",
  // List available aggregators
  List_Aggregators = "listAggregators",
  // Perform Oracle heartbeat
  Oracle_Heartbeat = "oracleHeartbeat",
  // Read an aggregators last result
  Read_Aggregator = "readAggregator",
  // Request an update for a specific aggregator
  Update_Aggregator = "updateAggregator",
  // Turn the crank and update any available aggregators
  Turn_Crank = "turnCrank",
}
