import { IStoredBlock } from 'thorchain-info-common/build/interfaces/stored'
import { avg } from '../helpers/avg'
import { msBetween } from '../helpers/msBetween'

export function blockFinality (blocks: IStoredBlock[]) {
  return avg(msBetween(blocks.map(block => block.time)))
}
