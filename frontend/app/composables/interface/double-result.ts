export interface DoubleResult {
  k: string
  m: string
  yStdErr: string
  kStdErr: string
  mStdErr: string
  corr: string
}

export interface ExponentialResult {
  a: string
  b: string
  c: string
  aStdErr: string
  bStdErr: string
  corr: string
  yStdErr: string
}

export interface LogisticResult {
  L: string
  k: string
  x0: string
  LStdErr: string
  kStdErr: string
  x0StdErr: string
  corr: string
  yStdErr: string
}

export interface FitLine {
  id: number
  type: 'linear' | 'exponential' | 'logistic'
  name: string
  data: { id: number; x: string; y: string }[]
  result: DoubleResult | ExponentialResult | LogisticResult | null
  color: string
  legend?: string
  pointLegend?: string
  drawLinearRegionFittingLine?: Boolean
}
