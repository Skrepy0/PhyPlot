import { Decimal } from 'decimal.js'
export const meanStdDev = async (std_dev: string, count: string): Promise<string> => {
  return new Decimal(std_dev).div(new Decimal(count).sqrt()).toString()
}
