import fs from "node:fs";
import path from "node:path";
import { IAggregatorDefinition } from "../accounts";

export async function loadFeedsFromFs(): Promise<void> {
  const jsonsInDiectoryr = fs
    .readdirSync("./feeds")
    .filter((file) => path.extname(file) === ".json");

  const newFeeds = jsonsInDiectoryr.map((file) => {
    const fileData = fs.readFileSync(path.join("./feeds", file));
    const json: IAggregatorDefinition = JSON.parse(fileData.toString());
    if (!file.endsWith(".sample.json")) return json;
  });
  console.log(newFeeds);
}
