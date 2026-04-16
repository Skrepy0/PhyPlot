import Decimal from 'decimal.js'
import type { LogisticResult } from '../interface/double-result'

Decimal.set({
  precision: 40,
  rounding: Decimal.ROUND_HALF_UP,
})

function toScientific(v: Decimal, d = 6) {
  return v.toExponential(d - 1)
}

type Point = { x: Decimal; y: Decimal }

// ================= 主入口 =================
export async function getLogisticFit(points: { x: string; y: string }[]): Promise<LogisticResult> {
  const data: Point[] = points.map((p) => ({
    x: new Decimal(p.x),
    y: new Decimal(p.y),
  }))

  const result = fitLogistic(data)

  // 计算统计信息
  const stats = computeStats(data, result.L, result.k, result.x0)

  return {
    L: toScientific(result.L),
    k: toScientific(result.k),
    x0: toScientific(result.x0),
    LStdErr: '0',
    kStdErr: '0',
    x0StdErr: '0',
    corr: toScientific(stats.r2),
    yStdErr: toScientific(stats.stderr),
  }
}

// ================= 逻辑拟合主函数 =================
export function fitLogistic(data: Point[]) {
  // ===== 初始值（非常关键）=====
  const maxY = data.reduce((m, p) => Decimal.max(m, p.y), data[0].y)
  const minY = data.reduce((m, p) => Decimal.min(m, p.y), data[0].y)

  let L = maxY.times(1.1) // 稍微放大
  let k = new Decimal(10) // 你数据增长很快
  let x0 = data[Math.floor(data.length / 2)].x

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
      const expTerm = k.neg().times(p.x.minus(x0)).exp()
      const denom = new Decimal(1).plus(expTerm)
      const yhat = L.div(denom)

      const r = p.y.minus(yhat)
      loss = loss.plus(r.pow(2))

      // Jacobian
      const dL = new Decimal(1).div(denom)
      const dk = L.times(expTerm).times(p.x.minus(x0)).div(denom.pow(2))
      const dx0 = L.times(expTerm).times(k).neg().div(denom.pow(2))

      const J = [dL, dk, dx0]

      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          H[i][j] = H[i][j].plus(J[i].times(J[j]))
        }
        g[i] = g[i].plus(J[i].times(r))
      }
    }

    for (let i = 0; i < 3; i++) {
      H[i][i] = H[i][i].plus(lambda)
    }

    const delta = solve3x3(H, g)
    if (!delta) break

    const nL = L.plus(delta[0])
    const nk = k.plus(delta[1])
    const nx0 = x0.plus(delta[2])

    const newLoss = computeLoss(data, nL, nk, nx0)

    if (newLoss.lt(loss)) {
      L = nL
      k = nk
      x0 = nx0
      lambda = lambda.div(10)
    } else {
      lambda = lambda.times(10)
    }
  }

  return { L, k, x0 }
}

// ================= 工具函数 =================
function computeLoss(data: Point[], L: Decimal, k: Decimal, x0: Decimal) {
  let s = new Decimal(0)
  for (const p of data) {
    const yhat = L.div(new Decimal(1).plus(k.neg().times(p.x.minus(x0)).exp()))
    s = s.plus(p.y.minus(yhat).pow(2))
  }
  return s
}

function computeStats(data: Point[], L: Decimal, k: Decimal, x0: Decimal) {
  const n = data.length

  let sumY = new Decimal(0)
  for (const p of data) sumY = sumY.plus(p.y)
  const mean = sumY.div(n)

  let ssTot = new Decimal(0)
  let ssRes = new Decimal(0)

  for (const p of data) {
    const yhat = L.div(new Decimal(1).plus(k.neg().times(p.x.minus(x0)).exp()))
    ssTot = ssTot.plus(p.y.minus(mean).pow(2))
    ssRes = ssRes.plus(p.y.minus(yhat).pow(2))
  }

  const r2 = new Decimal(1).minus(ssRes.div(ssTot))
  // 自由度 = n - 3 (3个参数：L, k, x0)
  const stderr = ssRes.div(n - 3).sqrt()

  return { r2, stderr }
}

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
