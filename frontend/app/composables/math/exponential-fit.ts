import { Decimal } from 'decimal.js'
import type { DoubleResult } from '~/composables/interface/double-result'
import { format, toScientific } from '~/composables/tools'

interface ExponentialResult {
  a: string
  b: string
  aStdErr: string
  bStdErr: string
  corr: string
  yStdErr: string
}

export const getExponentialFit = async (
  points: { x: string; y: string }[]
): Promise<ExponentialResult> => {
  if (points.length < 2) {
    throw new Error('至少需要2个数据点进行指数拟合')
  }

  // 过滤掉y <= 0的点，因为对数需要正数
  const validPoints = points.filter(p => {
    const y = parseFloat(p.y)
    return !isNaN(y) && y > 0
  })

  if (validPoints.length < 2) {
    throw new Error('指数拟合需要至少2个y值大于0的数据点')
  }

  const n = validPoints.length

  // 对y取自然对数：ln(y) = ln(a) + b*x
  const lnY = validPoints.map(p => Math.log(parseFloat(p.y)))
  const x = validPoints.map(p => parseFloat(p.x))

  // 计算必要的和
  const sumX = x.reduce((sum, xi) => sum + xi, 0)
  const sumLnY = lnY.reduce((sum, lny) => sum + lny, 0)
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0)
  const sumXLnY = x.reduce((sum, xi, i) => sum + xi * lnY[i], 0)

  // 计算线性回归参数（对ln(y) ~ x）
  const denominator = n * sumX2 - sumX * sumX
  if (Math.abs(denominator) < 1e-10) {
    throw new Error('无法计算指数拟合，数据点可能导致除零错误')
  }

  const b = (n * sumXLnY - sumX * sumLnY) / denominator
  const lnA = (sumLnY - b * sumX) / n
  const a = Math.exp(lnA)

  // 计算相关系数
  const yMean = sumLnY / n
  const xMean = sumX / n

  let numerator = 0
  let xVariance = 0
  let yVariance = 0

  for (let i = 0; i < n; i++) {
    numerator += (x[i] - xMean) * (lnY[i] - yMean)
    xVariance += (x[i] - xMean) ** 2
    yVariance += (lnY[i] - yMean) ** 2
  }

  const corr = numerator / Math.sqrt(xVariance * yVariance)

  // 计算残差标准误差
  let residualSum = 0
  for (let i = 0; i < n; i++) {
    const predicted = lnA + b * x[i]
    residualSum += (lnY[i] - predicted) ** 2
  }

  const yStdErr = Math.sqrt(residualSum / (n - 2))

  // 计算参数的标准误差
  const xVarianceMean = xVariance / n
  const aVariance = yStdErr ** 2 * (1/n + xMean ** 2 / xVariance)
  const bVariance = yStdErr ** 2 / xVariance

  const aStdErr = Math.sqrt(aVariance) * a // 误差传递：d(exp(x)) = exp(x)*dx
  const bStdErr = Math.sqrt(bVariance)

  const significantDigits = 4

  return {
    a: format(toScientific(a.toString()), significantDigits),
    b: format(toScientific(b.toString()), significantDigits),
    aStdErr: format(toScientific(aStdErr.toString()), significantDigits),
    bStdErr: format(toScientific(bStdErr.toString()), significantDigits),
    corr: format(toScientific(corr.toString()), significantDigits),
    yStdErr: format(toScientific(yStdErr.toString()), significantDigits)
  }
}