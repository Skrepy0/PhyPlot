export interface ToastItem {
  id: number
  message: string
  type?: 'info' | 'success' | 'error' | 'warning'
  duration?: number
}
export interface ToastOptions {
  type?: ToastItem['type']
  duration?: number
}
export type ToastFunction = (message: string, options?: ToastOptions) => void
