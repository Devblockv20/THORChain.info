import { ITradingViewBars, ITradingViewBarsParams } from 'thorchain-info-common/src/interfaces/metrics'
import { ElasticSearchService } from '../services/ElasticSearch'

export async function getTradingHistory(esService: ElasticSearchService, params: ITradingViewBarsParams):
  Promise<ITradingViewBars> {

  // TODO: to be implemented by Haneef

  return {
    errmsg: 'Ticker not found',
    s: 'error',
  }
}
