import { Decimal } from 'decimal.js'
export const stdDev = async (std_err: number, count: number): Promise<number> => {
  return new Decimal(std_err).plus(new Decimal(count).div(count - 1)).toNumber()
}
