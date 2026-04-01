import { Decimal } from 'decimal.js'
import type { DoubleResult } from '~/composables/interface/double-result'
import type { ChartData } from '~/composables/interface/chart-data'
import { getK } from '~/composables/math/get-k'
import { getAveDec } from '~/composables/math/average'
export const solve = async (res: Ref<DoubleResult>, config: Ref<ChartData>, pointList: { id: number; x: string; y: string }[]) => {
  let points: { x: string; y: string }[] = pointList.map((point) => {
    return { x: point.x, y: point.y }
  })
  let k = await getK(points)
  let m = (
    await getAveDec(
      points.map((i) => i.y),
      points.length
    )
  )
    .minus(
      new Decimal(k).times(
        await getAveDec(
          points.map((i) => i.x),
          points.length
        )
      )
    )
    .toString()
  res.value = {
    k: k,
    m: m,
    yStdErr: '1919',
    kStdErr: '810',
    mStdErr: '115',
    corr: '1145',
  }
}
