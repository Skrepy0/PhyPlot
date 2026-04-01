export const format = (value: string, digits: number): string => {
  const num = parseFloat(value)
  if (isNaN(num) || !isFinite(num)) {
    return '-'
  }
  return num.toFixed(digits)
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
