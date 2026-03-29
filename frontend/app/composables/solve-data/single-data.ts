import type { SingleResult } from '~/composables/interface/single-result'

export const solve = (res: Ref<SingleResult>) => {
  res.value = {
    count: 10,
    variance: 100,
    stdErr: 1000,
    meanStdDev: 0,
    mean: 0,
    stdDev: 0,
    uncertainty: 0,
    confidenceInterval: [0, 0],
  }
}
