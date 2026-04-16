import { Decimal } from 'decimal.js'

interface Point {
  x: string
  y: string
}

/**
 * 自动识别伏安特性曲线尾部线性区域，并拟合直线 y = kx + m
 * @param points 原始数据点（无需排序，x 允许乱序）
 * @returns 斜率 k 和截距 m 的字符串表示
 */
export const getRegionFitLine = (points: Point[]): { k: string; m: string } => {
  // 1. 数据预处理：转为数字、过滤无效点、按 x 升序排序
  const data = points
    .map((p) => ({ x: parseFloat(p.x), y: parseFloat(p.y) }))
    .filter((p) => !isNaN(p.x) && !isNaN(p.y))
    .sort((a, b) => a.x - b.x)

  if (data.length < 3) {
    return fallbackFit(data)
  }

  // 2. 计算相邻点间的斜率（一阶差分）及中点 x
  const slopes: number[] = []
  const midX: number[] = []
  for (let i = 0; i < data.length - 1; i++) {
    const current = data[i]!
    const next = data[i + 1]!
    const dx = next.x - current.x
    const dy = next.y - current.y
    if (dx !== 0) {
      slopes.push(dy / dx)
      midX.push((current.x + next.x) / 2)
    }
  }

  if (slopes.length < 2) {
    return fallbackFit(data)
  }

  // 3. 滑动窗口参数
  const windowSize = Math.min(5, Math.floor(slopes.length / 2))
  const relStdThreshold = 0.1 // 相对标准差阈值 10%

  let bestStartIdx = -1
  let bestEndIdx = -1
  let minRelStd = Infinity

  // 从尾部向头部滑动窗口，寻找斜率最稳定的连续区间
  for (let end = slopes.length - 1; end >= windowSize - 1; end--) {
    const start = end - windowSize + 1
    const windowSlopes = slopes.slice(start, end + 1)
    const mean = windowSlopes.reduce((a, b) => a + b, 0) / windowSlopes.length
    if (Math.abs(mean) < 1e-12) continue
    const variance = windowSlopes.reduce((sum, s) => sum + (s - mean) ** 2, 0) / windowSlopes.length
    const std = Math.sqrt(variance)
    const relStd = std / Math.abs(mean)

    if (relStd < minRelStd && relStd < relStdThreshold) {
      minRelStd = relStd
      bestStartIdx = start
      bestEndIdx = end
    }
  }

  // 4. 确定用于拟合的原始点索引范围
  let fitPoints: { x: number; y: number }[]
  if (bestStartIdx !== -1) {
    const startOrigIdx = bestStartIdx
    const endOrigIdx = bestEndIdx + 1
    fitPoints = data.slice(startOrigIdx, endOrigIdx + 1)
  } else {
    fitPoints = data.slice(-Math.min(5, data.length))
  }

  // 5. 对选中的点进行最小二乘线性拟合
  return leastSquaresFit(fitPoints)
}

/**
 * 降级拟合：直接使用全部点进行线性拟合
 */
function fallbackFit(data: { x: number; y: number }[]): { k: string; m: string } {
  if (data.length < 2) {
    throw new Error('至少需要两个有效数据点才能拟合直线')
  }
  return leastSquaresFit(data)
}

/**
 * 最小二乘法拟合直线 y = kx + m (使用 Decimal 高精度计算)
 */
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

  const kNum = sumXY.times(n).minus(sumX.times(sumY))
  const k = kNum.div(denominator)

  const mNum = sumY.minus(k.times(sumX))
  const m = mNum.div(n)

  return {
    k: k.toString(),
    m: m.toString(),
  }
}
