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

export async function getExponentialFit(points: { x: string; y: string }[]): Promise<ExponentialResult> {
  const data: Point[] = points.map((p) => ({
    x: new Decimal(p.x),
    y: new Decimal(p.y),
  }))

  const fit = fitExponentialLM(data)

  return {
    a: toScientific(fit.a),
    b: toScientific(fit.b),
    c: toScientific(fit.c),
    aStdErr: '0',
    bStdErr: '0',
    corr: toScientific(fit.r2),
    yStdErr: toScientific(fit.stderr),
  }
}

function fitExponentialLM(data: Point[]) {
  let { a, b, c } = guessInitialParams(data)

  let lambda = new Decimal(1e-3)
  const nu = new Decimal(2)
  let bestLoss = computeLoss(data, a, b, c)

  for (let iter = 0; iter < 200; iter++) {
    // 构建 Hessian 近似 H = J^T J 和右端项 g = J^T r
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

      const Ja = expbx
      const Jb = a.times(p.x).times(expbx)
      const Jc = new Decimal(1)

      H[0]![0] = H[0]![0]!.plus(Ja.times(Ja))
      H[0]![1] = H[0]![1]!.plus(Ja.times(Jb))
      H[0]![2] = H[0]![2]!.plus(Ja.times(Jc))
      H[1]![0] = H[1]![0]!.plus(Jb.times(Ja))
      H[1]![1] = H[1]![1]!.plus(Jb.times(Jb))
      H[1]![2] = H[1]![2]!.plus(Jb.times(Jc))
      H[2]![0] = H[2]![0]!.plus(Jc.times(Ja))
      H[2]![1] = H[2]![1]!.plus(Jc.times(Jb))
      H[2]![2] = H[2]![2]!.plus(Jc.times(Jc))

      // 关键修复：g = J^T r，而不是 -J^T r
      g[0] = g[0]!.plus(Ja.times(r))
      g[1] = g[1]!.plus(Jb.times(r))
      g[2] = g[2]!.plus(Jc.times(r))
    }

    // 梯度足够小或损失极小则提前结束
    if (g[0]!.abs().lt(new Decimal(1e-15)) && g[1]!.abs().lt(new Decimal(1e-15)) && g[2]!.abs().lt(new Decimal(1e-15))) break
    if (loss.lt(new Decimal(1e-20))) break

    // 添加阻尼项 H = H + lambda * I
    for (let i = 0; i < 3; i++) {
      H[i]![i] = H[i]![i]!.plus(lambda)
    }

    const delta = solve3x3(H, g)
    if (!delta) {
      lambda = lambda.times(nu)
      continue
    }

    const na = a.plus(delta[0])
    const nb = b.plus(delta[1])
    const nc = c.plus(delta[2])

    if (na.abs().gt(new Decimal(1e20)) || nb.abs().gt(new Decimal(1e20))) {
      lambda = lambda.times(nu)
      continue
    }

    const newLoss = computeLoss(data, na, nb, nc)
    if (newLoss.lt(loss)) {
      const improvement = loss.minus(newLoss)
      a = na
      b = nb
      c = nc
      bestLoss = newLoss
      lambda = lambda.div(nu)
      if (improvement.lt(1e-15) && lambda.lt(1e-15)) break
    } else {
      lambda = lambda.times(nu)
    }
  }

  return computeStats(data, a, b, c, 3)
}

function guessInitialParams(data: Point[]) {
  const n = data.length

  if (n >= 2) {
    const yRange = data
      .reduce((max, p) => Decimal.max(max, p.y), data[0]!.y)
      .minus(data.reduce((min, p) => Decimal.min(min, p.y), data[0]!.y))

    let c: Decimal
    if (yRange.lt(new Decimal(1e-10))) {
      c = new Decimal(0)
    } else {
      c = data.reduce((min, p) => Decimal.min(min, p.y), data[0]!.y).times(new Decimal(0.9))
    }

    let shifted = data.map((p) => ({ x: p.x, y: p.y.minus(c) }))
    let minShifted = shifted.reduce((m, p) => Decimal.min(m, p.y), shifted[0]!.y)
    if (minShifted.lte(0)) {
      c = c.minus(minShifted).plus(new Decimal(1e-6))
      shifted = data.map((p) => ({ x: p.x, y: p.y.minus(c) }))
    }

    let sumX = new Decimal(0)
    let sumLnY = new Decimal(0)
    let sumX2 = new Decimal(0)
    let sumXLnY = new Decimal(0)

    for (const p of shifted) {
      const lnY = p.y.ln()
      sumX = sumX.plus(p.x)
      sumLnY = sumLnY.plus(lnY)
      sumX2 = sumX2.plus(p.x.times(p.x))
      sumXLnY = sumXLnY.plus(p.x.times(lnY))
    }

    const denom = sumX2.times(n).minus(sumX.times(sumX))
    let b: Decimal, a: Decimal
    if (denom.abs().gt(new Decimal(1e-12))) {
      b = sumXLnY.times(n).minus(sumX.times(sumLnY)).div(denom)
      const lnA = sumLnY.minus(b.times(sumX)).div(n)
      a = lnA.exp()
    } else {
      b = new Decimal(0.5)
      const avgLnY = sumLnY.div(n)
      a = avgLnY.exp()
    }

    return { a, b, c }
  }

  return { a: new Decimal(1), b: new Decimal(0.5), c: new Decimal(0) }
}

function computeLoss(data: Point[], a: Decimal, b: Decimal, c: Decimal): Decimal {
  let sum = new Decimal(0)
  for (const p of data) {
    const yhat = a.times(b.times(p.x).exp()).plus(c)
    const diff = p.y.minus(yhat)
    sum = sum.plus(diff.pow(2))
  }
  return sum
}

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

  let r2: Decimal
  if (ssTot.lt(new Decimal(1e-20))) {
    r2 = new Decimal(1)
  } else {
    const r2Value = new Decimal(1).minus(ssRes.div(ssTot))
    r2 = Decimal.max(new Decimal(0), Decimal.min(new Decimal(1), r2Value))
  }

  const stderr = ssRes.div(n - k).sqrt()
  return { a, b, c, r2, stderr }
}

function solve3x3(A: Decimal[][], b: Decimal[]): [Decimal, Decimal, Decimal] | null {
  const m = A.map((r) => r.slice())
  const x = b.slice()

  for (let i = 0; i < 3; i++) {
    let pivot = m[i]![i]
    if (pivot!.abs().lt(new Decimal(1e-20))) return null

    for (let j = i; j < 3; j++) {
      m[i]![j] = m[i]![j]!.div(pivot!)
    }
    x[i] = x[i]!.div(pivot!)

    for (let k = 0; k < 3; k++) {
      if (k === i) continue
      const factor = m[k]![i]
      for (let j = i; j < 3; j++) {
        m[k]![j] = m[k]![j]!.minus(factor!.times(m[i]![j]!))
      }
      x[k] = x[k]!.minus(factor!.times(x[i]!))
    }
  }

  return [x[0]!, x[1]!, x[2]!]
}
