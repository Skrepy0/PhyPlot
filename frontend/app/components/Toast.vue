<script setup lang="ts">
import { ref } from 'vue'
import type { ToastItem } from '~/composables/interface/toast'

const toasts = ref<ToastItem[]>([])
let nextId = 0

const add = (
  message: string,
  options?: { type?: ToastItem['type']; duration?: number }
) => {
  const { type = 'info', duration = 3000 } = options || {}
  const id = nextId++
  toasts.value.push({ id, message, type, duration })

  setTimeout(() => remove(id), duration)
}

const remove = (id: number) => {
  const index = toasts.value.findIndex((t) => t.id === id)
  if (index !== -1) toasts.value.splice(index, 1)
}

defineExpose({ add })

const getIcon = (type: string) => {
  switch (type) {
    case 'success':
      return '✔'
    case 'error':
      return '✖'
    case 'warning':
      return '⚠'
    default:
      return 'ℹ'
  }
}
</script>

<template>
  <div class="toast-container">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="['toast', toast.type]"
      >
        <span class="toast-icon">{{ getIcon(toast.type || 'info') }}</span>
        <div class="toast-content">
          <span class="toast-message">{{ toast.message }}</span>
          <div
            class="progress"
            :style="{ animationDuration: (toast.duration || 3000) + 'ms' }"
          ></div>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped lang="scss">
.toast-container {
  position: fixed;
  top: 30px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2000;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  pointer-events: none;
}

.toast {
  min-width: 240px;
  max-width: 340px;
  padding: 14px 18px;
  border-radius: 14px;
  color: white;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(12px);
  pointer-events: auto;
  animation: slideIn 0.35s ease;
  border: 1px solid rgba(255, 255, 255, 0.08);

  &.success {
    background: linear-gradient(135deg, #38a169, #2f855a);
  }

  &.error {
    background: linear-gradient(135deg, #e53e3e, #c53030);
  }

  &.info {
    background: linear-gradient(135deg, #4a5568, #2d3748);
  }

  &.warning {
    background: linear-gradient(135deg, #ed8936, #dd6b20);
  }
}

.toast-icon {
  font-size: 18px;
  opacity: 0.9;
}

.toast-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.toast-message {
  line-height: 1.4;
}

.progress {
  height: 3px;
  margin-top: 6px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  overflow: hidden;
  position: relative;
}

.progress::after {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 100%;
  background: white;
  animation: progress linear forwards;
}

@keyframes progress {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

/* 动画 */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(-30px) scale(0.85);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(30px) scale(0.85);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
