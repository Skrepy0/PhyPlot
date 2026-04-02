<script setup lang="ts">
import { inject, ref, onMounted } from 'vue'
import type { ToastFunction, ToastOptions } from '~/composables/interface/toast'
import type { DoubleResult } from '~/composables/interface/double-result'
import type { ChartData } from '~/composables/interface/chart-data'
import type { Communicate } from '~/composables/interface/communicate'

const toast = inject<ToastFunction>('toast')
const imageSrc = ref('')
const loading = ref(false)
const error = ref('')

const loadChart = async (data: DoubleResult, config: ChartData, points: { id: number; x: string; y: string }[]) => {
  console.log(data)
  loading.value = true
  error.value = ''

  try {
    const body: Communicate = {
      config: config,
      data: data,
      points: points,
    }
    const response = await fetch('/api/chart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    const { image } = await response.json()
    if (!image || typeof image !== 'string') throw new Error('无效的图片数据')

    imageSrc.value = image
    toast?.('图表加载成功', { type: 'success' })
  } catch (err) {
    const message = err instanceof Error ? err.message : '图表加载失败，请稍后重试'
    error.value = message
    toast?.(message, { type: 'error' })
  } finally {
    loading.value = false
  }
}

const downloadChart = async () => {
  if (!imageSrc.value) {
    toast?.('没有图表可下载', { type: 'warning' })
    return
  }

  try {
    const response = await fetch(imageSrc.value)
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `chart-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)
    toast?.('图表下载成功', { type: 'success' })
  } catch (err) {
    toast?.('下载失败，请重试', { type: 'error' })
  }
}

defineExpose({ loadChart })
</script>

<template>
  <div class="chart-container">
    <div class="chart-wrapper">
      <div class="chart-header">
        <h2 class="card-title">生成的图表</h2>
      </div>

      <div class="chart-content">
        <div v-if="loading" class="loading-spinner">
          <div class="spinner"></div>
          <p>加载中...</p>
        </div>

        <div v-else-if="error" class="error-box">
          <div class="error-icon">⚠</div>
          <p class="error-text">{{ error }}</p>
          <button class="retry-btn" @click="loadChart">重新加载</button>
        </div>

        <Transition name="fade" v-else>
          <img v-if="imageSrc" :src="imageSrc" alt="统计图表" class="chart-img" />
        </Transition>
      </div>

      <div class="chart-footer">
        <button v-if="imageSrc && !loading" class="action-btn download-btn" @click="downloadChart" title="下载图表" aria-label="下载图表">
          <span class="btn-icon">⬇</span>
          <span class="btn-text">下载</span>
        </button>
        <button class="action-btn reload-btn" @click="loadChart" :disabled="loading" title="重新加载" aria-label="重新加载图表">
          <span class="btn-icon">🔄</span>
          <span class="btn-text">{{ loading ? '加载中...' : '刷新' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '../../../assets/scss/components/colors';
@import '../../../assets/scss/components/card';

.chart-container {
  width: 100%;
  display: flex;
  align-items: stretch;
  justify-content: center;
}

.chart-wrapper {
  width: 100%;
  background: rgba(10, 15, 12, 0.92);
  backdrop-filter: blur(12px);
  border-radius: 15px;
  border: 1px solid rgba(46, 204, 113, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  overflow: hidden;

  &:hover {
    border-color: rgba(46, 204, 113, 0.6);
    box-shadow: 0 12px 48px rgba(46, 204, 113, 0.15);
  }
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  border-bottom: 1px solid rgba(46, 204, 113, 0.1);
  background: linear-gradient(135deg, rgba(46, 204, 113, 0.05), rgba(39, 174, 96, 0.02));
}

.chart-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 10px 30px;
  border-top: 1px solid rgba(46, 204, 113, 0.1);
  background: rgba(0, 0, 0, 0.2);
}

.chart-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: linear-gradient(135deg, rgba(46, 204, 113, 0.15), rgba(39, 174, 96, 0.1));
  color: rgba(46, 204, 113, 0.9);
  border: 1px solid rgba(46, 204, 113, 0.3);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, rgba(46, 204, 113, 0.3), rgba(39, 174, 96, 0.2));
    border-color: rgba(46, 204, 113, 0.6);
    color: rgba(46, 204, 113, 1);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(46, 204, 113, 0.2);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.download-btn {
  &:hover {
    background: linear-gradient(135deg, rgba(46, 204, 113, 0.4), rgba(39, 174, 96, 0.3));
    box-shadow: 0 6px 16px rgba(46, 204, 113, 0.3);
  }
}

.reload-btn {
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, rgba(100, 200, 150, 0.3), rgba(80, 180, 130, 0.2));
  }
}

.btn-icon {
  font-size: 16px;
}

.btn-text {
  white-space: nowrap;
}

.chart-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 30px;
  height: 100%;
  position: relative;
}

.chart-img {
  max-width: 100%;
  max-height: 258px;
  border-radius: 12px;
  border: 1px solid rgba(46, 204, 113, 0.2);
  box-shadow: 0 4px 16px rgba(46, 204, 113, 0.1);
  transition: all 0.3s ease;
  object-fit: contain;

  &:hover {
    border-color: rgba(46, 204, 113, 0.5);
    box-shadow: 0 8px 24px rgba(46, 204, 113, 0.2);
    filter: brightness(1.05);
  }
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  width: 100%;

  p {
    color: rgba(46, 204, 113, 0.8);
    font-size: 16px;
    margin: 0;
    font-weight: 500;
  }
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(46, 204, 113, 0.2);
  border-top-color: rgba(46, 204, 113, 0.8);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 15px;
  padding: 30px;
  background: rgba(220, 53, 69, 0.1);
  border: 1px solid rgba(220, 53, 69, 0.3);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.error-icon {
  font-size: 48px;
  color: #dc3545;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.05);
  }
}

.error-text {
  color: #dc3545;
  font-size: 16px;
  margin: 0;
  text-align: center;
  font-weight: 500;
}

.retry-btn {
  padding: 10px 24px;
  background: linear-gradient(135deg, rgba(46, 204, 113, 0.8), rgba(39, 174, 96, 0.8));
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: linear-gradient(135deg, rgba(46, 204, 113, 1), rgba(39, 174, 96, 1));
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(46, 204, 113, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .chart-header {
    flex-direction: column;
    gap: 12px;
    padding: 16px 20px;
  }

  .chart-footer {
    padding: 12px 20px;
    justify-content: center;
  }

  .chart-content {
    padding: 20px;
    min-height: 300px;
  }

  .action-btn {
    padding: 8px 12px;
    font-size: 12px;
  }

  .btn-icon {
    font-size: 14px;
  }
}
</style>
