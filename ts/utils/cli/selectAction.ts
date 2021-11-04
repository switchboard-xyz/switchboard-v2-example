import prompts from "prompts";
import { QueueAction } from "../../cli/types";

export async function selectAction(): Promise<QueueAction> {
  const answer = await prompts([
    {
      type: "select",
      name: "action",
      message: "what do you want to do?",
      choices: [
        {
          title: "List Oracles",
          value: QueueAction.ListOracles,
        },
        {
          title: "Oracle Heartbeat",
          value: QueueAction.OracleHeartbeat,
        },
        {
          title: "List Aggregators",
          value: QueueAction.ListAggregators,
        },
        {
          title: "Read Aggregator Result",
          value: QueueAction.ReadAggregator,
        },
        {
          title: "Request Aggregator Update",
          value: QueueAction.UpdateAggregator,
        },
        {
          title: "Read the Crank",
          value: QueueAction.ListCrank,
        },
        {
          title: "Turn the Crank",
          value: QueueAction.TurnCrank,
        },
      ],
    },
  ]);
  return answer.action;
}

export {};
