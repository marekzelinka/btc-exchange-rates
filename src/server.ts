import { format } from 'date-fns';
import express from 'express';
import NodeCache from 'node-cache';
import path from 'node:path';
import * as url from 'node:url';
import { config } from './lib/config.js';
import { middleware } from './lib/middleware.js';
import type { ExchangeRateResult } from './lib/types.js';
import { getExchangeRates } from './services/exchange-rates.js';

const appCache = new NodeCache();

const app = express();

app.use(middleware.logger);

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
app.use(express.static(path.join(__dirname, '..', 'public')));
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '..', 'views'));

async function refreshExchangeRates(): Promise<ExchangeRateResult> {
  const rates = await getExchangeRates();
  const result = {
    timestamp: new Date(),
    data: rates,
  };

  appCache.set('exchangeRates', result, 600);

  console.info('Exchange rates cache updated');

  return result;
}

appCache.on('expired', async (key) => {
  try {
    if (key === 'exchangeRates') {
      await refreshExchangeRates();
    }
  } catch (error) {
    console.error(error);
  }
});

app.get('/', async (_req, res) => {
  try {
    let result: ExchangeRateResult | undefined = appCache.get('exchangeRates');

    if (!result) {
      result = await refreshExchangeRates();
    }

    res.render('home', {
      title: 'Bitcoin Exchange Rates',
      lastUpdated: format(result.timestamp, 'LLL dd, yyyy hh:mm:ss a O'),
      data: result.data,
    });
  } catch (error) {
    console.error(error);

    res.set('Content-Type', 'text/html');
    res.status(500).send('<h1>Internal Server Error</h1>');
  }
});

app.listen(config.PORT, async () => {
  console.log(`🚀 Server started on port: ${config.PORT}`);

  try {
    await refreshExchangeRates();
  } catch (err) {
    console.error('Unable to refresh exchange rate due to error: ', err);
  }
});
