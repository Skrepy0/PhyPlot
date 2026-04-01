import { Decimal } from 'decimal.js'
import { getAveDec } from '~/composables/math/average'
export const stdErr = async (vari: string): Promise<string> => {
  return new Decimal(vari).pow(0.5).toString()
}
export const getYStdErr = async (points: { x: string; y: string }[], k: string, m: string): Promise<string> => {
  let pointList = points.map((point) => {
    return { x: new Decimal(point.x), y: new Decimal(point.y) }
  })
  let sum = pointList.reduce((acc, cur) => acc.add(cur.y.minus(new Decimal(k).times(cur.x)).minus(m)), new Decimal(0))
  return sum
    .div(points.length - 2)
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
