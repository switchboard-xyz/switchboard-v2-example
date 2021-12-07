import fs from "node:fs";
import path from "node:path";
import { AggregatorSchema } from ".";
import { findProjectRoot } from "../utils/findProjectRoot";

export const AGGREGATOR_DEFINITION_PATH = path.join(
  findProjectRoot(),
  "accounts/sample.aggregator.json"
);

export const loadAggregatorDefinition = (
  inputFile?: string
): AggregatorSchema | undefined => {
  let fullInputFilePath = "";
  fullInputFilePath = inputFile
    ? findProjectRoot() + inputFile
    : AGGREGATOR_DEFINITION_PATH;
  if (!fs.existsSync(fullInputFilePath))
    throw new Error(`input file does not exist ${fullInputFilePath}`);

  try {
    const definitionString = fs.readFileSync(fullInputFilePath, "utf8");
    const definition: AggregatorSchema = JSON.parse(definitionString);
    return definition;
  } catch {
    return undefined;
  }
};
