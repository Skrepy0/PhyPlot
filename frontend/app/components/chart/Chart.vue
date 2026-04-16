<script setup lang="ts">
import { inject, ref } from 'vue'
import type { ToastFunction } from '~/composables/interface/toast'
import type { DoubleResult, ExponentialResult, FitLine } from '~/composables/interface/double-result'
import type { ChartData } from '~/composables/interface/chart-data'
import { fromScientific } from '~/composables/tools'
import type { ChartSettings } from '~/composables/interface/chart-settings'
import { getRegionFitLine } from '~/composables/math/regionFitLine'

const toast = inject<ToastFunction>('toast')

const imageSrc = ref('')
const loading = ref(false)
const error = ref('')

// 存储当前图表参数，以便刷新时复用
let currentData: DoubleResult | null = null
let currentConfig: ChartData | null = null
let currentPoints: { id: number; x: string; y: string }[] | null = null
let currentFitLines: FitLine[] | null = null

const loadChart = async (data: DoubleResult, config: ChartData, points: { id: number; x: string; y: string }[], fitLines?: FitLine[]) => {
  // 保存参数以便刷新时使用
  currentData = data
  currentConfig = config
  currentPoints = points
  currentFitLines = fitLines || null

  loading.value = true
  error.value = ''
  let chartDarkMode = false
  let showGrid = false
  const saved = localStorage.getItem('userSettings')
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      chartDarkMode = parsed.chartDarkMode ?? false
      showGrid = parsed.showGrid ?? false
    } catch (e) {}
  }
  const settings: ChartSettings = { chartDarkMode, showGrid }

  // 将科学计数法转换为普通数字字符串
  const newData: DoubleResult = {
    k: fromScientific(data.k),
    m: fromScientific(data.m),
    yStdErr: fromScientific(data.yStdErr),
    kStdErr: fromScientific(data.kStdErr),
    mStdErr: fromScientific(data.mStdErr), // 上面全是备用
    corr: fromScientific(data.corr),
  }

  try {
    const body: any = {
      config: config,
      data: newData,
      points: points,
      settings: settings,
    }

    // 添加多条拟合线数据
    if (fitLines && fitLines.length > 0) {
      body.fitLines = fitLines.map((line) => ({
        type: line.type,
        name: line.name,
        color: line.color,
        points: line.data,
        k: line.result && 'k' in line.result ? (line.result as DoubleResult).k : '0',
        m: line.result && 'm' in line.result ? (line.result as DoubleResult).m : '0',
        a: line.result && 'a' in line.result ? (line.result as ExponentialResult).a : '0',
        b: line.result && 'b' in line.result ? (line.result as ExponentialResult).b : '0',
        c: line.result && 'c' in line.result ? (line.result as ExponentialResult).c : '0',
        kStdErr: line.result && 'kStdErr' in line.result ? (line.result as DoubleResult).kStdErr : '0',
        mStdErr: line.result && 'mStdErr' in line.result ? (line.result as DoubleResult).mStdErr : '0',
        aStdErr: line.result && 'aStdErr' in line.result ? (line.result as ExponentialResult).aStdErr : '0',
        bStdErr: line.result && 'bStdErr' in line.result ? (line.result as ExponentialResult).bStdErr : '0',
        corr: line.result?.corr || '0',
        yStdErr: line.result?.yStdErr || '0',
      }))

      fitLines
        .filter((line: FitLine) => line.drawLinearRegionFittingLine)
        .forEach((line: FitLine) => {
          const points = line.data
          points.map((value) => {
            x: value.x
            y: value.y
          })
          const rfl = getRegionFitLine(points)
          const k: string = rfl.k
          const b: string = rfl.m
          const newLine = {
            type: 'linear',
            name: '',
            color: line.color,
            k: k,
            m: b,
            a: '0',
            b: '0',
            c: '0',
            kStdErr: '0',
            mStdErr: '0',
            aStdErr: '0',
            bStdErr: '0',
            corr: '0',
            yStdErr: '0',
          }
          body.fitLines.push(newLine)
        })
    }
    const response = await fetch('http://127.0.0.1:3001/api/chart', {
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

// 刷新当前图表（使用缓存的参数）
const refreshChart = () => {
  if (currentData && currentConfig && currentPoints) {
    loadChart(currentData, currentConfig, currentPoints, currentFitLines || undefined)
  } else {
    toast?.('没有可刷新的图表', { type: 'warning' })
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

// 暴露方法给父组件
defineExpose({ loadChart, refreshChart })
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
          <button class="retry-btn" @click="refreshChart">重新加载</button>
        </div>

        <Transition name="fade" v-else>
          <img v-if="imageSrc" :src="imageSrc" alt="统计图表" class="chart-img" />
        </Transition>
      </div>

      <div class="chart-footer">
        <button
          v-if="imageSrc && !loading"
          class="action-btn action-btn--download"
          @click="downloadChart"
          title="下载图表"
          aria-label="下载图表"
        >
          <span class="btn-icon">⬇</span>
          <span class="btn-text">下载</span>
        </button>
        <button class="action-btn action-btn--refresh" @click="refreshChart" :disabled="loading" title="重新加载" aria-label="重新加载图表">
          <span class="btn-icon">🔄</span>
          <span class="btn-text">{{ loading ? '加载中...' : '刷新' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '../../../assets/scss/_modern-theme.scss';

.chart-container {
  width: 100%;
  display: flex;
  align-items: stretch;
  justify-content: center;
}

.chart-wrapper {
  width: 100%;
  background: var(--glass-bg);
  backdrop-filter: blur(var(--blur-strength));
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-primary);
  display: flex;
  flex-direction: column;
  transition: var(--transition-normal);
  overflow: hidden;

  &:hover {
    border-color: var(--border-primary);
    box-shadow: var(--shadow-primary), var(--shadow-glow);
    transform: translateY(-2px);
  }

  &--glow {
    position: relative;

    &::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      padding: 2px;
      background: linear-gradient(135deg, var(--primary-green), var(--accent-blue), var(--primary-green));
      mask:
        linear-gradient(#fff 0 0) content-box,
        linear-gradient(#fff 0 0);
      mask-composite: xor;
      pointer-events: none;
      animation: border-flow 4s linear infinite;
    }
  }
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid var(--glass-border);
  background: linear-gradient(135deg, rgba(46, 204, 113, 0.05), rgba(39, 174, 96, 0.02));
}

.chart-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid var(--glass-border);
  background: rgba(0, 0, 0, 0.1);
}

.chart-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
  border: 1px solid var(--border-secondary);
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition-fast);
  text-decoration: none;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: var(--transition-normal);
  }

  &:hover::before {
    left: 100%;
  }

  &:hover:not(:disabled) {
    background: var(--primary-green-light);
    border-color: var(--primary-green);
    color: white;
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

  &--download {
    background: linear-gradient(135deg, var(--primary-green), var(--primary-green-dark));
    color: white;
    border-color: var(--primary-green);

    &:hover {
      background: linear-gradient(135deg, var(--primary-green-dark), var(--primary-green));
      box-shadow: 0 6px 16px rgba(46, 204, 113, 0.3);
    }
  }

  &--refresh {
    background: rgba(52, 152, 219, 0.1);
    border-color: rgba(52, 152, 219, 0.3);
    color: var(--accent-blue);

    &:hover:not(:disabled) {
      background: rgba(52, 152, 219, 0.2);
      border-color: var(--accent-blue);
      color: var(--accent-blue);
    }
  }
}

.btn-icon {
  font-size: 16px;
  transition: transform var(--transition-normal);

  .action-btn:hover & {
    transform: scale(1.1);
  }
}

.btn-text {
  white-space: nowrap;
  font-weight: 600;
}

.chart-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30px;
  min-height: 400px;
  position: relative;
}

.chart-img {
  max-width: 100%;
  max-height: 400px;
  border-radius: var(--radius-md);
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-primary);
  transition: var(--transition-normal);
  object-fit: contain;

  &:hover {
    border-color: var(--border-primary);
    box-shadow: var(--shadow-primary), var(--shadow-glow);
    filter: brightness(1.05);
    transform: scale(1.01);
  }
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  width: 100%;

  p {
    color: var(--text-secondary);
    font-size: 16px;
    margin: 0;
    font-weight: 500;
  }
}

.spinner {
  width: 60px;
  height: 60px;
  border: 4px solid var(--border-secondary);
  border-top-color: var(--primary-green);
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
  gap: 20px;
  padding: 40px;
  background: rgba(231, 76, 60, 0.1);
  border: 1px solid rgba(231, 76, 60, 0.3);
  border-radius: var(--radius-lg);
  backdrop-filter: blur(var(--blur-strength));
  text-align: center;
}

.error-icon {
  font-size: 48px;
  color: var(--error-red);
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
  color: var(--error-red);
  font-size: 16px;
  margin: 0;
  font-weight: 500;
  line-height: 1.5;
}

.retry-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, var(--primary-green), var(--primary-green-dark));
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition-normal);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: var(--transition-normal);
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(46, 204, 113, 0.3);
  }

  &:hover::before {
    left: 100%;
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

// 响应式设计
@media (max-width: 768px) {
  .chart-header {
    flex-direction: column;
    gap: 12px;
    padding: 16px;
  }

  .chart-footer {
    padding: 12px 16px;
    justify-content: center;
    flex-wrap: wrap;
  }

  .chart-content {
    padding: 20px;
    min-height: 300px;
  }

  .chart-img {
    max-height: 300px;
  }

  .action-btn {
    padding: 8px 16px;
    font-size: 12px;

    .btn-text {
      display: none;
    }
  }

  .btn-icon {
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .chart-wrapper {
    border-radius: var(--radius-md);
  }

  .chart-content {
    padding: 16px;
    min-height: 250px;
  }

  .chart-img {
    max-height: 250px;
  }

  .action-btn {
    padding: 6px 12px;
  }

  .btn-icon {
    font-size: 14px;
  }

  .error-box {
    padding: 24px;
  }

  .error-icon {
    font-size: 36px;
  }

  .error-text {
    font-size: 14px;
  }
}
</style>
