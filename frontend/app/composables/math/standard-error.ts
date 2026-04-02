import { Decimal } from 'decimal.js'
import { getAveDec } from '~/composables/math/average'
export const stdErr = async (vari: string): Promise<string> => {
  return new Decimal(vari).pow(0.5).toString()
}
export const getYStdErr = async (points: { x: string; y: string }[], k: string, m: string): Promise<string> => {
  const pointList = points.map((p) => ({
    x: new Decimal(p.x),
    y: new Decimal(p.y),
  }))

  const K = new Decimal(k)
  const M = new Decimal(m)

  const n = pointList.length
  if (n <= 2) return 'NaN'

  const sum = pointList.reduce((acc, cur) => {
    const yHat = K.times(cur.x).plus(M)
    const residual = cur.y.minus(yHat)
    return acc.plus(residual.pow(2))
  }, new Decimal(0))

  return sum
    .div(n - 2)
    .sqrt()
    .toString()
}
export const getKStdErr = async (yStdErr: string, points: { x: string; y: string }[]): Promise<string> => {
  return new Decimal(yStdErr)
    .div(
      new Decimal(points.length)
        .times(
          (
            await getAveDec(
              points.map((item) => new Decimal(item.x).pow(2).toString()),
              points.length.toString()
            )
          ).minus(
            (
              await getAveDec(
                points.map((item) => item.x.toString()),
                points.length.toString()
              )
            ).pow(2)
          )
        )
        .sqrt()
    )
    .toString()
}

export const getMStdErr = async (yStdErr: string, points: { x: string; y: string }[]): Promise<string> => {
  let averXSquare = await getAveDec(
    points.map((item) => new Decimal(item.x).pow(2).toString()),
    points.length.toString()
  )
  let averX = await getAveDec(
    points.map((item) => item.x.toString()),
    points.length.toString()
  )
  return new Decimal(yStdErr)
    .times(averXSquare.sqrt())
    .div(averXSquare.minus(averX.pow(2)).times(points.length).sqrt())
    .toString()
}
