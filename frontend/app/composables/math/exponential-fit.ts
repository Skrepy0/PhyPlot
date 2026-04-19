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
  let bestLoss = computeLoss(data, a, b, c)

  for (let iter = 0; iter < 150; iter++) {
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

      g[0] = g[0]!.plus(Ja.times(r))
      g[1] = g[1]!.plus(Jb.times(r))
      g[2] = g[2]!.plus(Jc.times(r))
    }

    if (loss.abs().lt(new Decimal(1e-20))) break

    for (let i = 0; i < 3; i++) {
      H[i]![i] = H[i]![i]!.plus(lambda)
    }

    const delta = solve3x3(H, g)
    if (!delta) break

    const stepScale = new Decimal(0.5)
    const na = a.plus(delta[0].times(stepScale))
    const nb = b.plus(delta[1].times(stepScale))
    const nc = c.plus(delta[2].times(stepScale))

    if (na.abs().gt(new Decimal(1e20)) || nb.abs().gt(new Decimal(1e20))) {
      lambda = lambda.times(10)
      continue
    }

    const newLoss = computeLoss(data, na, nb, nc)
    if (newLoss.lt(loss)) {
      a = na
      b = nb
      c = nc
      bestLoss = newLoss
      lambda = lambda.div(10)
    } else {
      lambda = lambda.times(10)
    }

    if (bestLoss.lt(1e-12) && lambda.lt(1e-12)) break
  }

  return computeStats(data, a, b, c, 3)
}

function guessInitialParams(data: Point[]) {
  const n = data.length
  const maxY = data.reduce((m, p) => Decimal.max(m, p.y), data[0]!.y)
  const minY = data.reduce((m, p) => Decimal.min(m, p.y), data[0]!.y)

  let c = minY.minus(new Decimal(1e-6))
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
  if (denom.abs().gt(1e-12)) {
    b = sumXLnY.times(n).minus(sumX.times(sumLnY)).div(denom)
    const lnA = sumLnY.minus(b.times(sumX)).div(n)
    a = lnA.exp()
  } else {
    b = new Decimal(0)
    const avgLnY = sumLnY.div(n)
    a = avgLnY.exp()
  }

  const firstY = data[0]!.y
  const lastY = data[n - 1]!.y
  const increasing = lastY.gt(firstY)
  if (!increasing && b.gt(0)) {
    b = b.neg()
    a = a.neg()
  }

  return { a, b, c }
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

  const r2 = new Decimal(1).minus(ssRes.div(ssTot))
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
