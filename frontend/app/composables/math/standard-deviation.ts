import { Decimal } from 'decimal.js'
export const stdDev = async (std_err: string, count: string): Promise<string> => {
  return new Decimal(std_err).plus(new Decimal(count).div(new Decimal(count).minus(1))).toString()
}
