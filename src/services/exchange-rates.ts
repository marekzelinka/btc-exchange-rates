import axios from 'axios';
import type { Rates } from '../lib/types.js';

export async function getExchangeRates(): Promise<Rates> {
  const response = await axios.get(
    'https://api.coingecko.com/api/v3/exchange_rates',
    {
      headers: {
        Accept: 'application/json',
      },
    }
  );

  return response.data;
}
