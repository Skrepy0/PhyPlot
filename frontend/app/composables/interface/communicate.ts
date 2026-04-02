import type { ChartData } from './chart-data'
import type { ChartSettings } from './chart-settings'
import type { DoubleResult } from './double-result'

export interface Communicate {
  config: ChartData
  data: DoubleResult
  points: { id: number; x: string; y: string }[]
  settings: ChartSettings
}
