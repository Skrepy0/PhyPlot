// p: '0.997', '0.95', '0.683'
export const getTFactor = (n: string, p: string): string => {
  const pNum = parseFloat(p)
  const nNum = parseInt(n, 10)

  if (isNaN(pNum) || isNaN(nNum)) return 'NaN'

  if (pNum === 0.997) {
    const list: string[] = [
      '235.8',
      '19.21',
      '9.21',
      '6.62',
      '5.51',
      '4.90',
      '4.53',
      '4.28',
      '4.09',
      '3.00',
    ]
    if (nNum > 20) return list.at(-1) as string
    if (nNum > 10) {
      switch (nNum) {
        case 12:
          return '3.85'
        case 15:
          return '3.64'
        case 20:
          return '3.45'
        default:
          return 'NaN'
      }
    }
    return list[nNum - 2] ?? 'NaN'
  }

  if (pNum === 0.95) {
    const list: string[] = [
      '12.71',
      '4.30',
      '3.18',
      '2.78',
      '2.57',
      '2.45',
      '2.36',
      '2.31',
      '2.26',
      '1.96',
    ]
    if (nNum > 20) return list.at(-1) as string
    if (nNum > 10) {
      switch (nNum) {
        case 12:
          return '2.20'
        case 15:
          return '2.14'
        case 20:
          return '2.09'
        default:
          return 'NaN'
      }
    }
    return list[nNum - 2] ?? 'NaN'
  }

  if (pNum === 0.683) {
    const list: string[] = [
      '1.84',
      '1.32',
      '1.20',
      '1.14',
      '1.11',
      '1.09',
      '1.08',
      '1.07',
      '1.06',
      '1.00',
    ]
    if (nNum > 20) return list.at(-1) as string
    if (nNum > 10) {
      switch (nNum) {
        case 12:
          return '1.05'
        case 15:
          return '1.04'
        case 20:
          return '1.03'
        default:
          return 'NaN'
      }
    }
    return list[nNum - 2] ?? 'NaN'
  }

  return 'NaN'
}
