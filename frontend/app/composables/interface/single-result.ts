export interface SingleResult {
  count: string
  variance: string
  stdErr: string
  meanStdDev: string
  mean: string
  stdDev: string
  uncertainty: [string, string] // [A类不确定度, B类不确定度]
  stdUncertainty: string
  confidenceInterval: [string, string]
}
