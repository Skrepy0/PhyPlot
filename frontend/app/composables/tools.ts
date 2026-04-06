export const format = (value: string, digits: number): string => {
  if (!value) return '-'

  let s = value.trim()

  if (!/^[-+]?(\d+(\.\d*)?|\.\d+)(e[-+]?\d+)?$/i.test(s)) {
    return '-'
  }

  const num = Number(s)
  if (!isFinite(num)) return '-'

  let result = num.toPrecision(digits)

  if (/e[+-]?0$/i.test(result)) {
    result = Number(result).toString()
  }

  result = result.replace(/e\+/, 'e')

  return result
}
export const copy = async (val: string | number, toast: any) => {
  if (val === '') {
    console.log(val)
    toast?.('当前没有可以复制的值', { type: 'warning' })
    return
  }

  try {
    await navigator.clipboard.writeText(String(val))
    toast?.(`已复制 ${val}`, { type: 'success' })
  } catch (err) {
    toast?.('复制失败', { type: 'error' })
  }
}
export function toScientific(input: string): string {
  if (!input) return '0'

  let s = input.trim()

  let sign = ''
  if (s[0] === '+' || s[0] === '-') {
    sign = s[0]
    s = s.slice(1)
  }

  let dotIndex = s.indexOf('.')
  if (dotIndex === -1) {
    dotIndex = s.length
    s += '.'
  }

  const digits = s.slice(0, dotIndex) + s.slice(dotIndex + 1)

  let i = 0
  while (i < digits.length && digits[i] === '0') i++

  if (i === digits.length) return '0'

  const first = digits[i]
  const rest = digits.slice(i + 1).replace(/0+$/, '')

  const exponent = dotIndex - i - 1

  let result = first
  if (rest.length > 0) result += '.' + rest

  if (exponent !== 0) {
    result += 'e' + exponent
  }

  return sign + result
}

export function fromScientific(input: string): string {
  if (!input) return '0'

  let s = input.trim()

  let sign = ''
  if (s[0] === '+' || s[0] === '-') {
    sign = s[0]
    s = s.slice(1)
  }

  const parts = s.split(/e/i)
  let base = parts[0]
  let exponent = parts[1] ? parseInt(parts[1], 10) : 0

  if (!base) return ''
  let dotIndex = base.indexOf('.')
  if (dotIndex === -1) {
    dotIndex = base.length
    base += '.'
  }

  const digits = base.replace('.', '')

  const newDotIndex = dotIndex + exponent

  let result: string

  if (newDotIndex <= 0) {
    result = '0.' + '0'.repeat(-newDotIndex) + digits
  } else if (newDotIndex >= digits.length) {
    result = digits + '0'.repeat(newDotIndex - digits.length)
  } else {
    result = digits.slice(0, newDotIndex) + '.' + digits.slice(newDotIndex)
  }

  result = result.replace(/^0+(\d)/, '$1')
  result = result.replace(/\.?0+$/, '')

  if (result === '') result = '0'

  return sign + result
}

export function verifyDataPoints(points: { id: number; x: string; y: string }[]): boolean {
  const pointSet = new Set<string>()
  points.forEach(point => pointSet.add(point.x))
  return pointSet.size === points.length
}