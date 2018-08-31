import { env } from '../helpers/env'
import { http } from '../helpers/http'
import { IStoredGenesis } from '../interfaces/stored'
import { IRpcGenesis } from '../interfaces/tendermint'
import { ElasticSearchService } from '../services/ElasticSearch'
import { EtlService } from '../services/EtlService'

export async function etlGenesis (etlService: EtlService, esService: ElasticSearchService) {
  try {
    const extracted = await extract()
    const transformed = transform(extracted.genesis)
    await load(esService, transformed)
  } catch (e) {
    // restart etl service
    etlService.stop()
    etlService.start()
  }
}

async function extract () {
  const { result }: { result: { genesis: IRpcGenesis } } = await http.get(env.TENDERMINT_RPC_REST + '/genesis')
  return result
}

function transform (genesis: IRpcGenesis): IStoredGenesis {
  const [ inflationN, inflationD ] = genesis.app_state.stake.pool.inflation.split('/')
  return {
    genesisTime: genesis.genesis_time,
    inflation: parseFloat(inflationN) / parseFloat(inflationD),
  }
}

async function load (esService: ElasticSearchService, transformed: IStoredGenesis) {
  await esService.client.index({
    body: transformed,
    id: 'genesis',
    index: 'blockchain',
    type: 'type',
  })
}
