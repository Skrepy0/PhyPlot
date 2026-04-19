import Decimal from 'decimal.js'

interface Point {
  x: string
  y: string
}

export const getRegionFitLine = (points: Point[]): { k: string; m: string } => {
  const data = points
    .map((p) => ({ x: parseFloat(p.x), y: parseFloat(p.y) }))
    .filter((p) => !isNaN(p.x) && !isNaN(p.y))
    .sort((a, b) => a.x - b.x)

  if (data.length < 3) return fallbackFit(data)

  const best = findBestLinearRegion(data)
  if (!best) return fallbackFit(data)

  return leastSquaresFit(data.slice(best.start, best.end + 1))
}

interface RegionResult {
  start: number
  end: number
  r: number
}

function findBestLinearRegion(data: { x: number; y: number }[]): RegionResult | null {
  let best: RegionResult | null = null
  const n = data.length

  for (let i = 0; i < n - 2; i++) {
    for (let j = i + 2; j < n; j++) {
      const segment = data.slice(i, j + 1)
      const r = calcCorrelation(segment)
      if (isNaN(r)) continue

      const absR = Math.abs(r)

      if (!best) {
        best = { start: i, end: j, r: absR }
        continue
      }

      const bestLen = best.end - best.start + 1
      const curLen = j - i + 1

      if (absR > best.r + 1e-6) {
        best = { start: i, end: j, r: absR }
      } else if (Math.abs(absR - best.r) < 1e-6 && curLen > bestLen) {
        best = { start: i, end: j, r: absR }
      }
    }
  }

  return best
}

function calcCorrelation(points: { x: number; y: number }[]): number {
  const n = points.length
  let sumX = 0
  let sumY = 0
  let sumXY = 0
  let sumX2 = 0
  let sumY2 = 0

  for (const p of points) {
    sumX += p.x
    sumY += p.y
    sumXY += p.x * p.y
    sumX2 += p.x * p.x
    sumY2 += p.y * p.y
  }

  const numerator = n * sumXY - sumX * sumY
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY))

  if (denominator === 0) return NaN

  return numerator / denominator
}

function fallbackFit(data: { x: number; y: number }[]): { k: string; m: string } {
  if (data.length < 2) {
    throw new Error('至少需要两个有效数据点才能拟合直线')
  }
  return leastSquaresFit(data)
}

function leastSquaresFit(points: { x: number; y: number }[]): { k: string; m: string } {
  const n = points.length
  let sumX = new Decimal(0)
  let sumY = new Decimal(0)
  let sumXY = new Decimal(0)
  let sumX2 = new Decimal(0)

  for (const p of points) {
    const x = new Decimal(p.x)
    const y = new Decimal(p.y)
    sumX = sumX.plus(x)
    sumY = sumY.plus(y)
    sumXY = sumXY.plus(x.times(y))
    sumX2 = sumX2.plus(x.times(x))
  }

  const denominator = sumX2.times(n).minus(sumX.times(sumX))
  if (denominator.eq(0)) {
    throw new Error('无法拟合垂直线，x 值无变化')
  }

  const k = sumXY.times(n).minus(sumX.times(sumY)).div(denominator)
  const m = sumY.minus(k.times(sumX)).div(n)

  return {
    k: k.toString(),
    m: m.toString(),
  }
}
