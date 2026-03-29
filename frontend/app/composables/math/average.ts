import { Decimal } from 'decimal.js'
export const average = async (
  list: string[],
  count: number
): Promise<number> => {
  if (count === 0) return 0
  const sum = list.reduce(
    (acc, val) => acc.add(new Decimal(val)),
    new Decimal(0)
  )
  return sum.div(count).toNumber()
}
