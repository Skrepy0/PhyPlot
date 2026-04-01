import { Decimal } from 'decimal.js'
import { getAveDec } from './average'
export const getCorr = async (points: { x: string; y: string }[]): Promise<string> => {
  let averX = await getAveDec(
    points.map((item) => item.x),
    points.length.toString()
  )
  let averXSquare = await getAveDec(
    points.map((item) => new Decimal(item.x).pow(2).toString()),
    points.length.toString()
  )
  let averY = await getAveDec(
    points.map((item) => item.y),
    points.length.toString()
  )
  let averYSquare = await getAveDec(
    points.map((item) => new Decimal(item.y).pow(2).toString()),
    points.length.toString()
  )
  let averXY = await getAveDec(
    points.map((item) => new Decimal(item.x).times(item.y).toString()),
    points.length.toString()
  )
  return averXY
    .minus(averX.times(averY))
    .div(
      averXSquare
        .minus(averX.pow(2))
        .times(averYSquare.minus(averY.pow(2)))
        .sqrt()
    )
    .toString()
}
