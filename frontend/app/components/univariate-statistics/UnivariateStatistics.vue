<script setup lang="ts">
import { ref, inject } from 'vue'
import DataTable from '~/components/data-components/DataTable.vue'
import type { SingleResult } from '~/composables/interface/single-result'
import { solve } from '~/composables/solve-data/single-data'
import { Decimal } from 'decimal.js'
import type { ToastFunction } from '~/composables/interface/toast'

const props = defineProps({ show: Boolean })

const confidenceOptions = ['68.3%', '95%', '99.7%']
const selectedConfidence = ref<string>('68.3%')
const errorDistributionOptions = ['均匀分布', '三角分布', '正态分布']
const selectedErrorDistribution = ref<string>('均匀分布')
const significantDigits = ref<number>(4)
const marginError = ref<string>('0')
const toast = inject<ToastFunction>('toast')
const singleData = ref<{ id: number; value: string }[]>([])

// 所有字段初始化为空字符串
const results = ref<SingleResult>({
  count: '',
  variance: '',
  stdErr: '',
  meanStdDev: '',
  mean: '',
  stdDev: '',
  uncertainty: ['', ''],
  stdUncertainty: '',
  confidenceInterval: ['', ''],
})
const copyValue = async (val: string | number) => {
  try {
    await navigator.clipboard.writeText(String(val))
    toast?.(`已复制 ${val}`, { type: 'success' })
  } catch (err) {
    toast?.('复制失败', { type: 'error' })
  }
}
const submit = async () => {
  if (singleData.value.length === 0) {
    toast?.('请输入数据点', { type: 'error' })
    return
  }
  const percentStr = selectedConfidence.value
  const parts = percentStr.split('%')
  if (parts.length < 2 || !parts[0]) {
    toast?.('请选择有效的置信概率', { type: 'error' })
    return
  }
  const p = new Decimal(parts[0]).div(100).toString()
  if ([1, 11, 13, 14, 16, 17, 18, 19].includes(singleData.value.length)) {
    toast?.('t因子表中无此次样本数量！', { type: 'warning' })
  }
  await solve(
    results,
    singleData.value,
    p,
    marginError.value,
    selectedErrorDistribution.value,
    significantDigits.value // 传入有效数字位数
  )
}
</script>

<template>
  <Transition name="slide-fade">
    <div v-if="props.show" class="us-container">
      <div class="cards-wrapper">
        <!-- 左侧 -->
        <div class="config-card">
          <h2 class="card-title">数据配置</h2>

          <div class="config-data-content">
            <!-- 表单 -->
            <div class="form-row">
              <label class="form-label">置信概率</label>
              <select v-model="selectedConfidence" class="form-select">
                <option v-for="opt in confidenceOptions" :key="opt">
                  {{ opt }}
                </option>
              </select>
            </div>
            <div class="form-row">
              <label class="form-label">误差分布</label>
              <select v-model="selectedErrorDistribution" class="form-select">
                <option v-for="opt in errorDistributionOptions" :key="opt">
                  {{ opt }}
                </option>
              </select>
            </div>
            <div class="form-row">
              <label class="form-label">误差限</label>
              <input type="number" v-model.number="marginError" class="form-input" min="1" max="10" />
            </div>

            <div class="form-row">
              <label class="form-label">有效数字</label>
              <input type="number" v-model.number="significantDigits" class="form-input" min="1" max="16" />
            </div>

            <!-- 表格区域（核心优化） -->

            <DataTable v-model="singleData" variable-type="single" />
            <div class="submit-btn-container">
              <button type="submit" class="submit-btn" @click="submit">开始统计</button>
            </div>
          </div>
        </div>

        <!-- 右侧 -->
        <div class="result-card">
          <h2 class="card-title">处理结果</h2>

          <div class="results-list">
            <div class="result-item" @click="copyValue(results.count)">
              <span class="result-label">数据总数n</span>
              <span class="result-value">
                {{ results.count || '-' }}
              </span>
            </div>
            <div class="result-item" @click="copyValue(results.mean)">
              <span class="result-label">算术平均值x̄</span>
              <span class="result-value">
                {{ results.mean || '-' }}
              </span>
            </div>
            <div class="result-item" @click="copyValue(results.variance)">
              <span class="result-label">方差D</span>
              <span class="result-value">
                {{ results.variance || '-' }}
              </span>
            </div>
            <div class="result-item" @click="copyValue(results.stdErr)">
              <span class="result-label">标准误差(方均根误差)σ</span>
              <span class="result-value">
                {{ results.stdErr || '-' }}
              </span>
            </div>
            <div class="result-item" @click="copyValue(results.stdDev)">
              <span class="result-label">样本标准差</span>
              <span class="result-value">
                {{ results.stdDev || '-' }}
              </span>
            </div>
            <div class="result-item" @click="copyValue(results.meanStdDev)">
              <span class="result-label">均值标准差</span>
              <span class="result-value">
                {{ results.meanStdDev || '-' }}
              </span>
            </div>
            <div class="result-item" @click="copyValue(results.uncertainty.at(0) || '-')">
              <span class="result-label">A类不确定度</span>
              <span class="result-value">
                {{ results.uncertainty.at(0) || '-' }}
              </span>
            </div>
            <div class="result-item" @click="copyValue(results.uncertainty.at(1) || '-')">
              <span class="result-label">B类不确定度</span>
              <span class="result-value">
                {{ results.uncertainty.at(1) || '-' }}
              </span>
            </div>
            <div class="result-item" @click="copyValue(results.stdUncertainty)">
              <span class="result-label">标准不确定度</span>
              <span class="result-value">
                {{ results.stdUncertainty || '-' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped lang="scss">
@use '../../../assets/scss/components/card';
@import '../../../assets/scss/components/colors';

.us-container {
  width: 100%;
  padding-left: 20px;
}

.config-card {
  flex: 1.2;
}

.result-card {
  flex: 0.8;
}

.config-card,
.result-card {
  display: flex;
  flex-direction: column;
  height: 700px;
  background: rgba(10, 15, 12, 0.92);
  backdrop-filter: blur(12px);
  border-radius: 24px;
  border: 1px solid rgba(46, 204, 113, 0.3);
  box-shadow: $shadow;
  padding: 24px;
  color: $text-primary;

  &:hover {
    border-color: $border-green;
    transform: translateY(-4px);
    transition: all 0.6s ease;
  }
}

.config-data-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
}

.table-container {
  flex: 1;
  display: flex;
  flex-direction: column;

  background: rgba(30, 37, 34, 0.6);
  border-radius: 14px;
  padding: 12px;

  overflow: hidden;
}

.table-container :deep(.data-table-container) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.table-container :deep(.table-wrapper) {
  flex: 1;
  overflow-y: auto;
}

.table-container :deep(.add-form) {
  margin-top: auto;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.35s cubic-bezier(0.2, 0.9, 0.4, 1.1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

@media (max-width: 800px) {
  .cards-wrapper {
    flex-direction: column;
  }

  .config-card,
  .result-card {
    width: 100%;
    height: auto;
  }
}
.config-card,
.result-card {
  animation: cardFadeIn 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

.result-card {
  animation-delay: 0.1s;
}

@keyframes cardFadeIn {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
