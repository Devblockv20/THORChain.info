import * as express from 'express'
import * as moment from 'moment'
import * as request from 'request'
import { env } from './helpers/env'
import { tokens } from './helpers/tokens'
import { getAllMetrics } from './metrics/getAllMetrics'
import { getExchangePair } from './metrics/getExchangePair'
import { getExchangeTrades } from './metrics/getExchangeTrades'
import { getRecentTxsMetrics } from './metrics/getRecentTxsMetrics'
import { getTradingViewBars } from './metrics/getTradingViewBars'
import { transactionsPerSecond } from './metrics/transactionsPerSecond'
import { getLastStoredBlocks } from './query/getLastStoredBlocks'
import { ElasticSearchService } from './services/ElasticSearch'
import { logger } from './services/logger'

const app = express()
const esService = new ElasticSearchService()

// enable cors
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})

app.get('/api/status', async (req, res) => {
  res.sendStatus(200)
})

app.get('/api/status/tps-gte-90', async (req, res) => {
  const txsPerSec = transactionsPerSecond(await getLastStoredBlocks(esService, 100))

  if (txsPerSec >= 90) {
    res.status(200).send('TPS over last 100 blocks: ' + txsPerSec)
  } else {
    res.status(500).send('TPS over last 100 blocks: ' + txsPerSec)
  }
})

app.get('/api/status/last-block-lte-90s', async (req, res) => {
  const lastBlock = await getLastStoredBlocks(esService, 1)

  if (!lastBlock[0]) {
    res.status(404).send('No blocks found')
    return
  }

  if (moment().diff(lastBlock[0].time, 'seconds') <= 90) {
    res.status(200).send('Last block at ' + lastBlock[0].time)
  } else {
    res.status(500).send('Last block at ' + lastBlock[0].time)
  }
})

app.get('/api/metrics', async (req, res) => {
  try {
    res.send(await getAllMetrics(esService))
  } catch (e) {
    logger.error(e)
    res.sendStatus(500)
  }
})

app.get('/api/recent-txs', async (req, res) => {
  const size = parseInt(req.query.size, 10) || 5
  try {
    res.send(await getRecentTxsMetrics(esService, size))
  } catch (e) {
    logger.error(e)
    res.sendStatus(500)
  }
})

// attach a small proxy for the lcd, useful for preventing cors issues on local development machines. This is a
// workaround until the LCD's CORS flag works: `thorchaincli advanced rest-server --cors "localhost"`, see
// https://github.com/cosmos/cosmos-sdk/search?q=flagcors&unscoped_q=flagcors&type=Code
app.use('/api/lcd', (req, res) => {
  if (req.method === 'OPTIONS') { res.sendStatus(200) }
  const url = env.LCD_API_HOST + req.url.replace('/api/lcd', '')
  req.pipe(request(url)).pipe(res)
})

app.get('/api/exchange/pair/:priceDenom/:amountDenom', async (req, res) => {
  try {
    res.send(await getExchangePair(esService, req.params))
  } catch (e) {
    logger.error(e)
    res.sendStatus(500)
  }
})

app.get('/api/exchange/trades/:priceDenom/:amountDenom', async (req, res) => {
  const account = req.query.account
  try {
    res.send(await getExchangeTrades(esService, req.params, account))
  } catch (e) {
    logger.error(e)
    res.sendStatus(500)
  }
})

app.get('/api/tradingview/config', (req, res) => {
  res.send({
    supported_resolutions: ['1', '5', '15', '30', '60', '1D', '1W', '1M'],
    supports_group_request: false,
    supports_marks: false,
    supports_search: true,
    supports_timescale_marks: false,
  })
})

app.get('/api/tradingview/history', async (req, res) => {
  res.send(await getTradingViewBars(esService, req.query))
})

app.get('/api/tradingview/search', async (req, res) => {
  const { query } = req.query

  const results = Object.keys(tokens).map((key) => tokens[key]).filter((token) => {
    if (!query || query === '') {
      return true
    }

    const tokenData = tokens[token.denom]
    const tokenName = tokenData ? tokenData.name.toUpperCase() : ''
    const searchTerm = query.toUpperCase()

    return token.denom.includes(searchTerm) || tokenName.includes(searchTerm)
  }).map((token) => ({
    'symbol': token.denom,
    'full_name': token.name,
    'description': `${token.name}`,
    'exchange': 'ASGARDEX',
    'ticker': token.denom,
    'type': 'crypto',
  }))

  res.send(results)
})

app.get('/api/tradingview/symbols', async (req, res) => {
  const { symbol } = req.query

  const token = tokens[symbol]

  if (!token) {
    res.sendStatus(404)
    return
  }

  res.send({
    'symbol': token.denom,
    'full_name': token.name,
    'description': `${token.name}`,
    'exchange': 'ASGARDEX',
    'listed_exchange': 'ASGARDEX',
    'ticker': token.denom,
    'type': 'crypto',
    'session': '24x7',
    'minmov': 1,
    'pricescale': 10000,
    'has_intraday': true,
    'intraday_multipliers': ['1']
  })
})

app.get('/api/tradingview/time', (req, res) => {
  res.send(Math.floor(Date.now() / 1000))
})

/**
 * Proxying binance APIs because of cross-origin issues
 */
app.get('/api/swap/prices', async (req, res) => {
  req.pipe(request('https://api.binance.com/api/v3/ticker/price')).pipe(res)
})

app.listen(3001, () => {
  logger.info('THORChain.info API listening on port 3001!')
})
