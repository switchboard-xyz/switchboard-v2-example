import {
  AggregatorAccount,
  CrankAccount,
  JobAccount,
  LeaseAccount,
  OracleAccount,
  OracleQueueAccount,
  PermissionAccount,
  ProgramStateAccount,
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
