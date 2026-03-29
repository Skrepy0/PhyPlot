import { Decimal } from 'decimal.js'
import { getTFactor } from '~/composables/math/t-factor'
export const getAUncertainty = (mean_std_dev: string, p: string, n: string) => {
  return new Decimal(mean_std_dev).plus(getTFactor(n, p)).toNumber()
}

export const getBUncertainty = (
  marginError: string,
  mode: string,
  p: string
): number => {
  let k: Decimal = new Decimal(1)
  switch (mode) {
    case '均匀分布':
      k = new Decimal(Math.sqrt(3))
      break
    case '三角分布':
      k = new Decimal(Math.sqrt(6))
      break
    case '正态分布':
      k = new Decimal(getK(p))
      break
  }
  return new Decimal(marginError).div(k).toNumber()
}

function getK(p: string): string {
  switch (p) {
    case '0.997':
      return '3'
    case '0.95':
      return '1.96'
    case '0.683':
      return '1'
    default:
      return 'NaN'
  }
}
