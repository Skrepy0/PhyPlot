export interface DialogOptions {
  message: string
  title?: string
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
  onCancel?: () => void
}
