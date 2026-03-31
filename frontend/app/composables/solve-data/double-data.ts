import { Decimal } from 'decimal.js'
import type { DoubleResult } from '~/composables/interface/double-result'
export const solve = async (res: Ref<DoubleResult>) => {
  res.value = {
    k: '1145',
    m: '14',
    yStdErr: '1919',
    kStdErr: '810',
    mStdErr: '115',
    corr: '1145',
  }
}
