import { Decimal } from 'decimal.js'
export const variance = async (list: string[], count: string, ave: string): Promise<string> => {
  if (count === '0') return '0'
  return list
    .reduce((acc, val) => acc.add(new Decimal(val).minus(ave).pow(2)), new Decimal(0))
    .div(count)
    .toString()
}
