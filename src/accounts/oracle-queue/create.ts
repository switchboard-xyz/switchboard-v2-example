import { OracleQueueAccount } from "@switchboard-xyz/switchboard-v2";
import { loadAnchor } from "../../utils/loadAnchor";
import { getOracleQueue, getProgramStateAccount } from "../";
import { toAccountString } from "../../utils/toAccountString";

export const createOracleQueue = async (): Promise<OracleQueueAccount> => {
  const { program, authority } = await loadAnchor();
  const programStateAccount = await getProgramStateAccount(program);
  console.log(
    toAccountString("Program Account", programStateAccount.publicKey)
  );

  const oracleQueueAccount = await getOracleQueue(program, authority.publicKey);
  console.log(
    toAccountString("Oracle Queue Account", oracleQueueAccount.publicKey)
  );
  return oracleQueueAccount;
};
