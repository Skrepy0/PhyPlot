import { Decimal } from 'decimal.js'
export const average = async (list: string[], count: string): Promise<string> => {
  return (await getAveDec(list, count)).toString()
}
export const getAveDec = async (list: string[], count: string): Promise<Decimal> => {
  if (count === '0') return new Decimal(0)
  const sum = list.reduce((acc, val) => acc.add(new Decimal(val)), new Decimal(0))
  return sum.div(count)
}
