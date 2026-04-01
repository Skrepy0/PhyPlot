import type { ChartData } from './chart-data'
import type { DoubleResult } from './double-result'

export interface Communicate {
  config: ChartData
  data: DoubleResult
}
