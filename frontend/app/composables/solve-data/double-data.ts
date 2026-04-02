import { Decimal } from 'decimal.js'
import type { DoubleResult } from '~/composables/interface/double-result'
import type { ChartData } from '~/composables/interface/chart-data'
import { getK } from '~/composables/math/get-k'
import { getAveDec } from '~/composables/math/average'
import { format, toScientific } from '~/composables/tools'
import { getKStdErr, getMStdErr, getYStdErr } from '~/composables/math/standard-error'
import { getCorr } from '../math/getCorr'

export const solve = async (
  res: Ref<DoubleResult>,
  config: Ref<ChartData>,
  pointList: {
    id: number
    x: string
    y: string
  }[]
) => {
  let points: { x: string; y: string }[] = pointList.map((point) => {
    return { x: point.x, y: point.y }
  })
  const significantDigits: number = config.value.significantDigits
  let k = await getK(points)
  let m = (
    await getAveDec(
      points.map((i) => i.y),
      points.length.toString()
    )
  )
    .minus(
      new Decimal(k).times(
        await getAveDec(
          points.map((i) => i.x),
          points.length.toString()
        )
      )
    )
    .toString()
  let yStdErr = await getYStdErr(points, k, m)
  let kStdErr = await getKStdErr(yStdErr, points)
  let mStdErr = await getMStdErr(yStdErr, points)
  res.value = {
    k: format(toScientific(k), significantDigits),
    m: format(toScientific(m), significantDigits),
    yStdErr: format(toScientific(yStdErr), significantDigits),
    kStdErr: format(toScientific(kStdErr), significantDigits),
    mStdErr: format(toScientific(mStdErr), significantDigits),
    corr: format(toScientific(await getCorr(points)), significantDigits),
  }
}
