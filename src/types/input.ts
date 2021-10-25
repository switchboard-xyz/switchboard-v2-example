export interface EndpointSources {
  binanceCom?: string;
  binanceUs?: string;
  bitfinex?: string;
  bitstamp?: string;
  bittrex?: string;
  coinbase?: string;
  ftxCom?: string;
  ftxUs?: string;
  huobi?: string;
  kraken?: string;
  kucoin?: string;
  mxc?: string;
  okex?: string;
  orca?: string;
  orcaLp?: string;
  smb?: string;
  solanalysis?: string;
  solanart?: string;
}
export interface AggregatorDefinition {
  name: string;
  batchSize: number;
  minRequiredOracleResults: number;
  minRequiredJobResults: number;
  minUpdateDelaySeconds: number;
  jobs: EndpointSources;
}
