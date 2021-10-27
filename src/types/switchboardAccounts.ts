import {
  ProgramStateAccount,
  OracleAccount,
  PermissionAccount,
  OracleQueueAccount,
  CrankAccount,
  AggregatorAccount,
  LeaseAccount,
  JobAccount,
} from "@switchboard-xyz/switchboard-v2";

export type SwitchboardAccount =
  | ProgramStateAccount
  | OracleAccount
  | OracleQueueAccount
  | CrankAccount
  | AggregatorAccount
  | PermissionAccount
  | LeaseAccount
  | JobAccount;
