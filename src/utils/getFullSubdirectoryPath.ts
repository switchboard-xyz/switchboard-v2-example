import fs from "node:fs";
import { KEYPAIR_OUTPUT } from "../types";

export const getFullSubdirectoryPath = (
  subdirectory: string[] | undefined
): string => {
  let fullPath = KEYPAIR_OUTPUT;
  if (!subdirectory) return fullPath;
  for (const path of subdirectory) {
    fullPath += `/${path}`;
    if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath);
  }
  return fullPath;
};
