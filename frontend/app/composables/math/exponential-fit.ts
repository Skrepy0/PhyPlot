import Decimal from 'decimal.js'
import type { ExponentialResult } from '../interface/double-result'

Decimal.set({
  precision: 40,
  rounding: Decimal.ROUND_HALF_UP,
})

function toScientific(v: Decimal, d = 6) {
  return v.toExponential(d - 1)
}

type Point = { x: Decimal; y: Decimal }

// ================= 主入口 =================
export async function getExponentialFit(points: { x: string; y: string }[]): Promise<ExponentialResult> {
  const data: Point[] = points.map((p) => ({
    x: new Decimal(p.x),
    y: new Decimal(p.y),
  }))

  const fit2 = fit2Param(data)
  const fit3 = fit3ParamLM(data)

  const aic2 = computeAIC(data, fit2, 2)
  const aic3 = computeAIC(data, fit3, 3)

  const best = aic3.lt(aic2) ? fit3 : fit2

  return {
    a: toScientific(best.a),
    b: toScientific(best.b),
    c: toScientific(best.c),
    aStdErr: '0',
    bStdErr: '0',
    corr: toScientific(best.r2),
    yStdErr: toScientific(best.stderr),
  }
}

// ================= 2参数模型 =================
function fit2Param(data: Point[]) {
  const n = data.length

  let sumX = new Decimal(0)
  let sumZ = new Decimal(0)
  let sumX2 = new Decimal(0)
  let sumXZ = new Decimal(0)

  for (const p of data) {
    const z = p.y.ln()
    sumX = sumX.plus(p.x)
    sumZ = sumZ.plus(z)
    sumX2 = sumX2.plus(p.x.times(p.x))
    sumXZ = sumXZ.plus(p.x.times(z))
  }

  const denom = sumX2.times(n).minus(sumX.times(sumX))
  const b = sumXZ.times(n).minus(sumX.times(sumZ)).div(denom)
  const lnA = sumZ.minus(b.times(sumX)).div(n)
  const a = lnA.exp()
  const c = new Decimal(0)

  // 二参数模型，k = 2
  return computeStats(data, a, b, c, 2)
}

// ================= 3参数 LM =================
function fit3ParamLM(data: Point[]) {
  // 1. 先用二参数拟合得到稳定的初始 a, b（c=0）
  const { a: a0, b: b0 } = fit2Param(data)
  let a = a0
  let b = b0
  let c = new Decimal(0) // 从0开始，LM会自适应

  let lambda = new Decimal(1e-3)

  for (let iter = 0; iter < 100; iter++) {
    let H = [
      [new Decimal(0), new Decimal(0), new Decimal(0)],
      [new Decimal(0), new Decimal(0), new Decimal(0)],
      [new Decimal(0), new Decimal(0), new Decimal(0)],
    ]
    let g = [new Decimal(0), new Decimal(0), new Decimal(0)]
    let loss = new Decimal(0)

    for (const p of data) {
      const expbx = b.times(p.x).exp()
      const yhat = a.times(expbx).plus(c)
      const r = p.y.minus(yhat)
      loss = loss.plus(r.pow(2))

      const J = [expbx, a.times(p.x).times(expbx), new Decimal(1)]

      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          H[i]![j] = H[i]![j]!.plus(J[i]!.times(J[j]!))
        }
        g[i] = g[i]!.plus(J[i]!.times(r))
      }
    }

    // 检查 loss 是否已极小
    if (loss.abs().lt(new Decimal(1e-20))) break

    for (let i = 0; i < 3; i++) {
      H[i]![i] = H[i]![i]!.plus(lambda)
    }

    const delta = solve3x3(H, g)
    if (!delta) break

    const na = a.plus(delta[0])
    const nb = b.plus(delta[1])
    const nc = c.plus(delta[2])

    // 防止参数变成无效值（如负数指数参数）
    if (nb.lte(0) || na.lte(0)) {
      lambda = lambda.times(10)
      continue
    }

    const newLoss = computeLoss(data, na, nb, nc)

    if (newLoss.lt(loss)) {
      a = na
      b = nb
      c = nc
      lambda = lambda.div(10)
    } else {
      lambda = lambda.times(10)
    }
  }

  return computeStats(data, a, b, c, 3)
}

// ================= 工具 =================
function computeLoss(data: Point[], a: Decimal, b: Decimal, c: Decimal) {
  let s = new Decimal(0)
  for (const p of data) {
    const yhat = a.times(b.times(p.x).exp()).plus(c)
    s = s.plus(p.y.minus(yhat).pow(2))
  }
  return s
}

// 修正：增加参数 k 表示模型参数个数
function computeStats(data: Point[], a: Decimal, b: Decimal, c: Decimal, k: number) {
  const n = data.length

  let sumY = new Decimal(0)
  for (const p of data) sumY = sumY.plus(p.y)
  const mean = sumY.div(n)

  let ssTot = new Decimal(0)
  let ssRes = new Decimal(0)

  for (const p of data) {
    const yhat = a.times(b.times(p.x).exp()).plus(c)
    ssTot = ssTot.plus(p.y.minus(mean).pow(2))
    ssRes = ssRes.plus(p.y.minus(yhat).pow(2))
  }

  const r2 = new Decimal(1).minus(ssRes.div(ssTot))
  // 自由度 = n - k
  const stderr = ssRes.div(n - k).sqrt()

  return { a, b, c, r2, stderr }
}

function computeAIC(data: Point[], fit: any, k: number) {
  const n = data.length
  const rss = computeLoss(data, fit.a, fit.b, fit.c)
  return new Decimal(n).times(rss.div(n).ln()).plus(new Decimal(2 * k))
}

// ===== 3x3解 =====
function solve3x3(A: Decimal[][], b: Decimal[]) {
  const m = A.map((r) => r.slice())
  const x = b.slice()

  for (let i = 0; i < 3; i++) {
    let pivot = m[i]![i]!
    if (pivot.abs().lt(new Decimal(1e-20))) return null

    for (let j = i; j < 3; j++) {
      m[i]![j] = m[i]![j]!.div(pivot)
    }
    x[i] = x[i]!.div(pivot)

    for (let k = 0; k < 3; k++) {
      if (k === i) continue
      const factor = m[k]![i]!
      for (let j = i; j < 3; j++) {
        m[k]![j] = m[k]![j]!.minus(factor.times(m[i]![j]!))
      }
      x[k] = x[k]!.minus(factor.times(x[i]!))
    }
  }

  return x as [Decimal, Decimal, Decimal]
}
