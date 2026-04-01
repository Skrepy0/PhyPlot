<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { DialogOptions } from '~/composables/interface/dialog'

const isVisible = ref(false)
let resolvePromise: ((value: boolean) => void) | null = null
let currentOptions: DialogOptions = {
  message: '',
  title: '提示',
  confirmText: '确定',
  cancelText: '取消',
}

// 打开对话框，返回 Promise<boolean>
const show = (options: DialogOptions): Promise<boolean> => {
  currentOptions = {
    title: '提示',
    confirmText: '确定',
    cancelText: '取消',
    ...options,
  }
  isVisible.value = true
  return new Promise((resolve) => {
    resolvePromise = resolve
  })
}

// 确定
const handleConfirm = async () => {
  if (currentOptions.onConfirm) {
    await currentOptions.onConfirm()
  }
  if (resolvePromise) resolvePromise(true)
  close()
}

// 取消
const handleCancel = async () => {
  if (currentOptions.onCancel) {
    await currentOptions.onCancel()
  }
  if (resolvePromise) resolvePromise(false)
  close()
}

const close = () => {
  isVisible.value = false
  resolvePromise = null
}

// ESC 关闭
const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && isVisible.value) {
    handleCancel()
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
})

defineExpose({ show })
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isVisible" class="dialog-overlay" @click.self="handleCancel">
        <div class="dialog-container">
          <div class="dialog-header">
            <div class="icon-info">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="12" x2="12" y2="16" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </div>
            <h3 class="dialog-title">{{ currentOptions.title }}</h3>
          </div>
          <div class="dialog-body">
            <p class="dialog-message">{{ currentOptions.message }}</p>
          </div>
          <div class="dialog-footer">
            <button class="dialog-btn cancel-btn" @click="handleCancel">
              {{ currentOptions.cancelText }}
            </button>
            <button class="dialog-btn confirm-btn" @click="handleConfirm">
              {{ currentOptions.confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2100;
}

.dialog-container {
  background: rgba(10, 15, 12, 0.95);
  backdrop-filter: blur(12px);
  border-radius: 24px;
  border: 1px solid rgba(46, 204, 113, 0.4);
  box-shadow: 0 20px 35px rgba(0, 0, 0, 0.5);
  width: 360px;
  max-width: 90%;
  padding: 20px 24px;
  color: #e0e0e0;
  animation: slideUp 0.25s ease-out;
}

.dialog-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.icon-info {
  color: #2ecc71;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dialog-title {
  font-size: 1.4rem;
  font-weight: 500;
  margin: 0;
  color: #2ecc71;
}

.dialog-body {
  margin: 16px 0 24px 0;
}

.dialog-message {
  font-size: 1rem;
  line-height: 1.5;
  margin: 0;
  word-break: break-word;
  color: #e0e0e0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.dialog-btn {
  border: none;
  border-radius: 40px;
  padding: 8px 20px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &.cancel-btn {
    background: rgba(255, 255, 255, 0.1);
    color: #b0b0b0;
    &:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: translateY(-1px);
    }
  }

  &.confirm-btn {
    background: linear-gradient(135deg, #2ecc71, #27ae60);
    color: white;
    box-shadow: 0 2px 8px rgba(46, 204, 113, 0.3);
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(46, 204, 113, 0.4);
    }
  }
}

/* 遮罩层淡入淡出 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 容器从下方滑入 */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
