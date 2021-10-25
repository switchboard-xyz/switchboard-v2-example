import { KEYPAIR_OUTPUT } from "../types";
import fs from "fs";

export const getFullSubdirectoryPath = (
  subdirectory: string[] | undefined
): string => {
  let fullPath = KEYPAIR_OUTPUT;
  if (!subdirectory) return fullPath;
  for (const path of subdirectory) {
    fullPath += `/${path}`;
    if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath);
  }
  console.log(fullPath);
  return fullPath;
};
