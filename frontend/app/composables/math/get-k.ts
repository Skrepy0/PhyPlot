import { Decimal } from 'decimal.js'
import { getAveDec } from '~/composables/math/average'

export const getK = async (points: { x: string; y: string }[]): Promise<string> => {
  let pointList: { x: Decimal; y: Decimal }[] = points.map((point) => {
    return { x: new Decimal(point.x), y: new Decimal(point.y) }
  })
  let averX = new Decimal(
    await getAveDec(
      points.map((i) => i.x),
      pointList.length.toString()
    )
  )
  let averY = new Decimal(
    await getAveDec(
      points.map((i) => i.y),
      pointList.length.toString()
    )
  )
  let averXSquare = new Decimal(
    await getAveDec(
      pointList.map((i) => i.x.pow(2).toString()),
      pointList.length.toString()
    )
  )
  let averXY = new Decimal(
    await getAveDec(
      pointList.map((i) => i.x.times(i.y).toString()),
      pointList.length.toString()
    )
  )
  return averX.times(averY).minus(averXY).div(averX.pow(2).minus(averXSquare)).toString()
}
