import { Decimal } from 'decimal.js'
import { getAveDec } from '~/composables/math/average'

export const getK = async (points: { x: string; y: string }[]): Promise<string> => {
  let pointList: { x: Decimal; y: Decimal }[] = points.map((point) => {
    return { x: new Decimal(point.x), y: new Decimal(point.y) }
  })
  let averX = new Decimal(
    await getAveDec(
      points.map((i) => i.x),
      pointList.length
    )
  )
  let averY = new Decimal(
    await getAveDec(
      points.map((i) => i.y),
      pointList.length
    )
  )
  let molecule = new Decimal(0)
  let denominator = new Decimal(0)
  pointList.forEach((point) => {
    molecule = molecule.add(point.x.minus(averX).times(point.y.minus(averY)))
    denominator = denominator.add(point.x.minus(averX).pow(2))
  })
  return molecule.div(denominator).toString()
}
