import { Decimal } from 'decimal.js'
export const stdErr = async (vari: number): Promise<number> => {
  return new Decimal(vari).pow(0.5).toNumber()
}
