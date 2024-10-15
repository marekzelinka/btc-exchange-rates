export interface Currency {
  name: string;
  unit: string;
  value: number;
  type: string;
}

export interface Rates {
  rates: Record<string, Currency>;
}

export interface ExchangeRateResult {
  timestamp: Date;
  data: Rates;
}
