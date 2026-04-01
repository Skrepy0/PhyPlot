import { inject, type Ref } from 'vue'
import type { SingleResult } from '~/composables/interface/single-result'
import { average } from '~/composables/math/average'
import { variance } from '~/composables/math/variance'
import { stdErr } from '~/composables/math/standard-error'
import { stdDev } from '~/composables/math/standard-deviation'
import { meanStdDev } from '~/composables/math/mean-std-dev'
import { getAUncertainty, getBUncertainty } from '~/composables/math/uncertainty'
import { Decimal } from 'decimal.js'
import type { ToastFunction } from '~/composables/interface/toast'
import { format } from '~/composables/tools'

const toast = inject<ToastFunction>('toast')

export const solve = async (
  res: Ref<SingleResult>,
  data: { id: number; value: string }[],
  confidence: string,
  marginError: string,
  errorDistribution: string,
  significantDigits: number
) => {
  const dataList = data.map((item) => item.value)
  const count = dataList.length.toString()
  const mean = await average(dataList, count)
  const vari = await variance(dataList, count, mean)
  const std_err = await stdErr(vari)
  const std_dev = await stdDev(std_err, count)
  const mean_std_dev = await meanStdDev(std_dev, count)
  const uncertainty_a = await getAUncertainty(String(mean_std_dev), confidence, String(count))
  const uncertainty_b = await getBUncertainty(marginError, errorDistribution, confidence)
  const stdUncertainty = new Decimal(uncertainty_a).pow(2).add(new Decimal(uncertainty_b).pow(2)).sqrt().toString()

  res.value = {
    count: format(count, 0),
    variance: format(vari, significantDigits),
    stdErr: format(std_err, significantDigits),
    meanStdDev: format(mean_std_dev, significantDigits),
    mean: format(mean, significantDigits),
    stdDev: format(std_dev, significantDigits),
    uncertainty: [format(uncertainty_a, significantDigits), format(uncertainty_b, significantDigits)],
    stdUncertainty: format(stdUncertainty, significantDigits),
    confidenceInterval: ['0', '0'],
  }
}
