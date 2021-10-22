

export default function solanalysisFloorPrice(
  projectId: string
): Array<OracleJob.Task> {
  return [
    OracleJob.Task.create({
      httpTask: {
        url: "https://solanalysis-graphql-dot-feliz-finance.uc.r.appspot.com",
        method: OracleJob.HttpTask.Method.METHOD_POST,
        headers: [{ key: "Content-Type", value: "application/json" }],
        body: JSON.stringify({
          operationName: "GetProjectStatsQuery",
          query:
            "query GetProjectStatsQuery { getProjectStats { project_stats { project_id floor_price } } }",
          variables: {},
        }),
      },
    }),
    OracleJob.Task.create({
      jsonParseTask: {
        path: `$.data.getProjectStats.project_stats[?(@.project_id == '${projectId}')].floor_price`,
      },
    }),
  ];
}
