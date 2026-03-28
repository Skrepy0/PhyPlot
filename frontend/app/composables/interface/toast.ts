export interface ToastItem {
  id: number
  message: string
  type?: 'info' | 'success' | 'error' | 'warning'
  duration?: number
}
