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

export async function getLogisticFit(points: { x: string; y: string }[]): Promise<LogisticResult> {
  const data: Point[] = points.map((p) => ({
    x: new Decimal(p.x),
    y: new Decimal(p.y),
  }))

  const result = fitLogisticAuto(data)
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

function fitLogisticAuto(data: Point[]) {
  const n = data.length
  const firstY = data[0]!.y
  const lastY = data[n - 1]!.y

  const increasing = lastY.gt(firstY)

  let L: Decimal, k: Decimal, x0: Decimal

  const maxY = data.reduce((m, p) => Decimal.max(m, p.y), data[0]!.y)
  const minY = data.reduce((m, p) => Decimal.min(m, p.y), data[0]!.y)

  if (increasing) {
    L = maxY
  } else {
    L = minY
  }

  const midY = maxY.plus(minY).div(2)
  let closestIdx = 0
  let minDiff = midY.minus(data[0]!.y).abs()
  for (let i = 1; i < n; i++) {
    const diff = midY.minus(data[i]!.y).abs()
    if (diff.lt(minDiff)) {
      minDiff = diff
      closestIdx = i
    }
  }
  x0 = data[closestIdx]!.x

  const dy = lastY.minus(firstY)
  const dx = lastY.minus(firstY)
  const dxActual = data[n - 1]!.x.minus(data[0]!.x)
  if (dxActual.abs().gt(1e-12) && dy.abs().gt(1e-12)) {
    const slope = dy.div(dxActual)
    let kEst = slope.times(4).div(L.abs())
    if (increasing) {
      kEst = kEst.times(L.gt(0) ? 1 : -1)
    } else {
      kEst = kEst.times(L.gt(0) ? -1 : 1)
    }
    if (kEst.abs().gt(1e-12) && kEst.abs().lt(1e10)) {
      k = kEst
    } else {
      k = new Decimal(increasing ? (L.gt(0) ? 1 : -1) : L.gt(0) ? -1 : 1)
    }
  } else {
    k = new Decimal(increasing ? (L.gt(0) ? 1 : -1) : L.gt(0) ? -1 : 1)
  }

  if (k.abs().lt(1e-12)) k = new Decimal(0.1)

  let lambda = new Decimal(1e-3)
  let bestLoss = computeLoss(data, L, k, x0)

  for (let iter = 0; iter < 150; iter++) {
    let H = [
      [new Decimal(0), new Decimal(0), new Decimal(0)],
      [new Decimal(0), new Decimal(0), new Decimal(0)],
      [new Decimal(0), new Decimal(0), new Decimal(0)],
    ]
    let g = [new Decimal(0), new Decimal(0), new Decimal(0)]
    let loss = new Decimal(0)

    for (const p of data) {
      const z = k.neg().times(p.x.minus(x0))
      let expTerm: Decimal
      try {
        expTerm = z.exp()
      } catch {
        expTerm = new Decimal(Infinity)
      }
      const denom = new Decimal(1).plus(expTerm)
      const yhat = L.div(denom)
      const r = p.y.minus(yhat)
      loss = loss.plus(r.pow(2))

      const dL = new Decimal(1).div(denom)
      const dk = L.times(expTerm).times(p.x.minus(x0)).div(denom.pow(2))
      const dx0 = L.times(expTerm).times(k).neg().div(denom.pow(2))

      const J = [dL, dk, dx0]

      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          H[i]![j] = H[i]![j]!.plus(J[i]!.times(J[j]!))
        }
        g[i] = g[i]!.plus(J[i]!.times(r))
      }
    }

    if (loss.abs().lt(1e-20)) break

    for (let i = 0; i < 3; i++) {
      H[i]![i] = H[i]![i]!.plus(lambda)
    }

    const delta = solve3x3(H, g)
    if (!delta) break

    const stepScale = new Decimal(0.5)
    let nL = L.plus(delta[0].times(stepScale))
    let nk = k.plus(delta[1].times(stepScale))
    let nx0 = x0.plus(delta[2].times(stepScale))

    if (nL.abs().gt(1e20) || nk.abs().gt(1e20)) {
      lambda = lambda.times(10)
      continue
    }

    const newLoss = computeLoss(data, nL, nk, nx0)

    if (newLoss.lt(loss)) {
      L = nL
      k = nk
      x0 = nx0
      bestLoss = newLoss
      lambda = lambda.div(10)
    } else {
      lambda = lambda.times(10)
    }

    if (bestLoss.lt(1e-12) && lambda.lt(1e-12)) break
  }

  return { L, k, x0 }
}

function computeLoss(data: Point[], L: Decimal, k: Decimal, x0: Decimal): Decimal {
  let sum = new Decimal(0)
  for (const p of data) {
    const expTerm = k.neg().times(p.x.minus(x0)).exp()
    const denom = new Decimal(1).plus(expTerm)
    const yhat = L.div(denom)
    const diff = p.y.minus(yhat)
    sum = sum.plus(diff.pow(2))
  }
  return sum
}

function computeStats(data: Point[], L: Decimal, k: Decimal, x0: Decimal) {
  const n = data.length
  let sumY = new Decimal(0)
  for (const p of data) sumY = sumY.plus(p.y)
  const mean = sumY.div(n)

  let ssTot = new Decimal(0)
  let ssRes = new Decimal(0)

  for (const p of data) {
    const expTerm = k.neg().times(p.x.minus(x0)).exp()
    const yhat = L.div(new Decimal(1).plus(expTerm))
    ssTot = ssTot.plus(p.y.minus(mean).pow(2))
    ssRes = ssRes.plus(p.y.minus(yhat).pow(2))
  }

  const r2 = new Decimal(1).minus(ssRes.div(ssTot))
  const stderr = ssRes.div(n - 3).sqrt()
  return { r2, stderr }
}

function solve3x3(A: Decimal[][], b: Decimal[]): [Decimal, Decimal, Decimal] | null {
  const m = A.map((row) => row.slice())
  const x = b.slice()

  for (let i = 0; i < 3; i++) {
    let pivot = m[i]![i]
    if (pivot!.abs().lt(new Decimal(1e-20))) return null

    for (let j = i; j < 3; j++) {
      m[i]![j]! = m[i]![j]!.div(pivot!)
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
