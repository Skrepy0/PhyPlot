import { Decimal } from 'decimal.js'
import type { DoubleResult, ExponentialResult, LogisticResult, FitLine } from '~/composables/interface/double-result'
import type { ChartData } from '~/composables/interface/chart-data'
import { getK } from '~/composables/math/get-k'
import { getAveDec } from '~/composables/math/average'
import { format, toScientific } from '~/composables/tools'
import { getKStdErr, getMStdErr, getYStdErr } from '~/composables/math/standard-error'
import { getCorr } from '../math/getCorr'
import { getExponentialFit } from '~/composables/math/exponential-fit'
import { getLogisticFit } from '~/composables/math/logistic-fit'

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

export const solveExponential = async (
  res: Ref<ExponentialResult>,
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

  const result = await getExponentialFit(points)
  res.value = {
    a: result.a,
    b: result.b,
    c: result.c,
    aStdErr: result.aStdErr,
    bStdErr: result.bStdErr,
    corr: result.corr,
    yStdErr: result.yStdErr,
  }
}

export const solveLogistic = async (
  res: Ref<LogisticResult>,
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

  const result = await getLogisticFit(points)
  res.value = {
    L: result.L,
    k: result.k,
    x0: result.x0,
    LStdErr: result.LStdErr,
    kStdErr: result.kStdErr,
    x0StdErr: result.x0StdErr,
    corr: result.corr,
    yStdErr: result.yStdErr,
  }
}

export const solveMultipleLines = async (lines: FitLine[], config: Ref<ChartData>) => {
  const results: FitLine[] = []

  for (const line of lines) {
    const lineResult = { ...line }

    if (line.type === 'linear') {
      const tempResult = ref<DoubleResult>({
        k: '',
        m: '',
        yStdErr: '',
        kStdErr: '',
        mStdErr: '',
        corr: '',
      })
      await solve(tempResult, config, line.data)
      lineResult.result = tempResult.value
    } else if (line.type === 'exponential') {
      const tempResult = ref<ExponentialResult>({
        a: '',
        b: '',
        c: '',
        aStdErr: '',
        bStdErr: '',
        corr: '',
        yStdErr: '',
      })
      await solveExponential(tempResult, config, line.data)
      lineResult.result = tempResult.value
    } else if (line.type === 'logistic') {
      const tempResult = ref<LogisticResult>({
        L: '',
        k: '',
        x0: '',
        LStdErr: '',
        kStdErr: '',
        x0StdErr: '',
        corr: '',
        yStdErr: '',
      })
      await solveLogistic(tempResult, config, line.data)
      lineResult.result = tempResult.value
    }

    results.push(lineResult)
  }

  return results
}
