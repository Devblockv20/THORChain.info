export interface ITxMetrics {
  height: number,
  type: 'tx' | 'clp',
  from: string,
  to: string,
  amountFrom: string,
  amountTo: string,
  time: string,
}

export interface IClpMetrics {
  baseTicker: string,
  ticker: string,
  baseNum: number,
  num: number,
  price: number,
  volume: number,
  transactions: number,
  liquidityFee: number,
}

export interface ITokenMetrics {
  name: string,
  ticker: string,
  amount: number,
  price: number,
  marketCap: number,
}

export interface IMetrics {
  clps: IClpMetrics[],
  network: {
    blockSizeLast100Blocks: number | null,
    blockHeight: number | null,
    capacityLast100Blocks: number | null,
    genesisTime: string | null,
    blockFinalityLast100Blocks: number | null,
    transactionsPerSecondLast100Blocks: number | null,
  },
  recentTxs: ITxMetrics[],
  software: {
    testnet: null | string,
    daemonVersion: null | string,
    explorerVersion: null | string,
  },
  tokens: ITokenMetrics[],
  transactions: {
    aveClpFeeLast100Blocks: number | null,
    aveTxFeeLast100Blocks: number | null,
    clpTimeLast100Blocks: number | null,
    totalAdresses: number | null,
    totalClpTxCount: number | null,
    totalTxCount: number | null,
    totalTransacted: number | null,
    totalExchanged: number | null,
    txTimeLast100Blocks: number | null,
  }
  validators: {
    validatorCount: null | number,
    totalStakedByValidators: null | number,
    totalStaked: null | number,
    backupValidatorCount: null | number,
    queuedStake: null | number,
    stakeLevel: null | number,
    delegatorCount: null | number,
    delegatedStake: null | number,
    networkSecurityInMUsd: null | number,
    blockReward: null | number,
    totalBlockRewards: null | number,
    inflation: null | number,
  }
}
