import { Decimal } from 'decimal.js'
export const meanStdDev = async (
  std_dev: number,
  count: number
): Promise<number> => {
  return new Decimal(std_dev).div(new Decimal(count).pow(0.5)).toNumber()
}
