import { SwitchboardPermission } from "@switchboard-xyz/switchboard-v2";

export const toPermissionString = (
  permission: SwitchboardPermission
): string => {
  switch (permission) {
    case SwitchboardPermission.PERMIT_ORACLE_HEARTBEAT:
      return "PERMIT_ORACLE_HEARTBEAT";
    case SwitchboardPermission.PERMIT_ORACLE_QUEUE_USAGE:
      return "PERMIT_ORACLE_QUEUE_USAGE";
    default:
      return "NONE";
  }
};
