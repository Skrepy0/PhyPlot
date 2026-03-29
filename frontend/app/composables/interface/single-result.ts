export interface SingleResult {
  count: number
  variance: number
  stdErr: number
  meanStdDev: number
  mean: number
  stdDev: number
  uncertainty: number
  confidenceInterval: [number, number]
}
