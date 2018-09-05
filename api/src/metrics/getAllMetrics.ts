import { IMetrics } from '../interfaces/metrics'
import { getLastStoredBlocks } from '../query/getLastStoredBlocks'
import { getStoredGenesis } from '../query/getStoredGenesis'
import { getStoredStatus } from '../query/getStoredStatus'
import { getStoredValidators } from '../query/getStoredValidators'
import { getTotalAddresses } from '../query/getTotalAddresses'
import { getTotalTxCounts } from '../query/getTotalTxCounts'
import { ElasticSearchService } from '../services/ElasticSearch'
import { blockFinality } from './blockFinality'
import { blockSize } from './blockSize'
import { capacity } from './capacity'
import { transactionsPerSecond } from './transactionsPerSecond'
import { transactionTime } from './transactionTime'
import { version } from './version'

export async function getAllMetrics(esService: ElasticSearchService): Promise<IMetrics> {
  const { genesisTime } = await getStoredGenesis(esService)
  const { chainId } = await getStoredStatus(esService)
  const { validatorCount, totalStaked, totalStakedByValidators } = await getStoredValidators(esService)
  const last100Blocks = await getLastStoredBlocks(esService, 100)
  const totalAddresses = await getTotalAddresses(esService)
  const { totalClpTxs, totalExchanged, totalTransacted, totalTxs } = await getTotalTxCounts(esService)

  return {
    network: {
      blockFinalityLast100Blocks: blockFinality(last100Blocks),
      blockHeight: last100Blocks[0].height,
      blockSizeLast100Blocks: blockSize(last100Blocks),
      capacityLast100Blocks: capacity(last100Blocks),
      genesisTime,
      transactionsPerSecondLast100Blocks: transactionsPerSecond(last100Blocks),
    },
    software: {
      daemonVersion: '0.1.0', // TOD'
      explorerVersion: version(),
      testnet: chainId,
    },
    transactions: {
      aveClpFeeLast100Blocks: null, // TODO
      aveTxFeeLast100Blocks: null, // TODO
      clpTimeLast100Blocks: transactionTime(last100Blocks),
      totalAddresses,
      totalClpTxCount: totalClpTxs,
      totalExchanged,
      totalTransacted,
      totalTxCount: totalTxs,
      txTimeLast100Blocks: transactionTime(last100Blocks),
    },
    validators: {
      backupValidatorCount: null, // TODO
      blockReward: null, // TODO
      delegatedStake: totalStaked - totalStakedByValidators,
      delegatorCount: null, // TODO
      inflation: null, // TODO
      networkSecurityInMUsd: null, // TODO
      queuedStake: null, // TODO
      stakeLevel: totalStakedByValidators / totalStaked,
      totalBlockRewards: null, // TODO
      totalStaked,
      totalStakedByValidators,
      validatorCount,
    },
  }
}
