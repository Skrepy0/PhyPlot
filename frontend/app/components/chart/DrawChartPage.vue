<script setup lang="ts">
import DataTable from '~/components/data-components/DataTable.vue'
import { inject, ref } from 'vue'
import Chart from '~/components/chart/Chart.vue'
import type { ToastFunction } from '~/composables/interface/toast'
import type { ChartData } from '~/composables/interface/chart-data'
import type { DoubleResult } from '~/composables/interface/double-result'
import { solve } from '~/composables/solve-data/double-data'
const props = defineProps({
  show: Boolean,
})
const confidenceOptions = ['68.3%', '95%', '99.7%']
const draftingMethodOptions = ['线性拟合']
const errorDistributionOptions = ['均匀分布', '三角分布', '正态分布']
const toast = inject<ToastFunction>('toast')
const lineData = ref<{ id: number; x: string; y: string }[]>([])
const chartRef = ref<InstanceType<typeof Chart> | null>(null)
const configData = ref<ChartData>({
  chartTitle: '',
  draftingMethod: '线性拟合',
  confidence: '68.3%',
  errorDistribution: '均匀分布',
  marginError: '0',
  significantDigits: 4,
  xName: '',
  yName: '',
  pointCutline: '',
  lineCutline: '',
})
const results = ref<DoubleResult>({
  k: '',
  m: '',
  yStdErr: '',
  kStdErr: '',
  mStdErr: '',
  corr: '',
})

const submit = () => {
  solve(results)
  if (chartRef.value) {
    chartRef.value.loadChart(results.value, configData.value)
    console.log('图表已刷新')
  }
}
</script>

<template>
  <Transition name="slide-fade">
    <div v-if="props.show" class="draw-chart-page">
      <div class="cards-wrapper">
        <div class="config-card">
          <h2 class="card-title">数据配置</h2>
          <div class="config-data-content">
            <div class="configuration-box">
              <div class="left-config">
                <div class="form-row">
                  <label class="form-label">表头</label>
                  <input class="form-input" v-model="configData.chartTitle" />
                </div>
                <div class="form-row">
                  <label class="form-label">拟合方式</label>
                  <select
                    v-model="configData.draftingMethod"
                    class="form-select"
                  >
                    <option v-for="opt in draftingMethodOptions" :key="opt">
                      {{ opt }}
                    </option>
                  </select>
                </div>
                <div class="form-row">
                  <label class="form-label">置信概率</label>
                  <select v-model="configData.confidence" class="form-select">
                    <option v-for="opt in confidenceOptions" :key="opt">
                      {{ opt }}
                    </option>
                  </select>
                </div>
                <div class="form-row">
                  <label class="form-label">误差分布</label>
                  <select
                    v-model="configData.errorDistribution"
                    class="form-select"
                  >
                    <option v-for="opt in errorDistributionOptions" :key="opt">
                      {{ opt }}
                    </option>
                  </select>
                </div>
                <div class="form-row">
                  <label class="form-label">误差限</label>
                  <input
                    type="number"
                    v-model.number="configData.marginError"
                    class="form-input"
                    min="1"
                    max="10"
                  />
                </div>
              </div>
              <div class="right-config">
                <div class="form-row">
                  <label class="form-label">有效数字</label>
                  <input
                    type="number"
                    v-model.number="configData.significantDigits"
                    class="form-input"
                    min="1"
                    max="16"
                  />
                </div>
                <div class="form-row">
                  <label class="form-label">x轴名称</label>
                  <input class="form-input" v-model="configData.xName" />
                </div>
                <div class="form-row">
                  <label class="form-label">y轴名称</label>
                  <input class="form-input" v-model="configData.yName" />
                </div>
                <div class="form-row">
                  <label class="form-label">点图例</label>
                  <input class="form-input" v-model="configData.pointCutline" />
                </div>
                <div class="form-row">
                  <label class="form-label">线图例</label>
                  <input class="form-input" v-model="configData.lineCutline" />
                </div>
              </div>
            </div>
            <DataTable variable-type="double" v-model="lineData" />
            <div class="submit-btn-container">
              <button type="submit" class="submit-btn" @click="submit">
                完成
              </button>
            </div>
          </div>
        </div>
        <div class="result-box">
          <div class="data-result">
            <div class="data-res-content">
              <h2 class="card-title">统计</h2>
            </div>
            <div class="results-container">
              <div class="res-left">
                <div class="results-list">
                  <div class="result-item">
                    <span class="result-label">斜率k</span>
                    <span class="result-value"> {{ results.k || '-' }} </span>
                  </div>
                  <div class="result-item">
                    <span class="result-label">截距m</span>
                    <span class="result-value">{{ results.m || '-' }}</span>
                  </div>
                  <div class="result-item">
                    <span class="result-label">y的标准误差</span>
                    <span class="result-value">{{
                      results.yStdErr || '-'
                    }}</span>
                  </div>
                </div>
              </div>
              <div class="res-right">
                <div class="results-list">
                  <div class="result-item">
                    <span class="result-label">斜率k的标准误差</span>
                    <span class="result-value">{{
                      results.kStdErr || '-'
                    }}</span>
                  </div>
                  <div class="result-item">
                    <span class="result-label">截距m的标准误差</span>
                    <span class="result-value">{{
                      results.mStdErr || '-'
                    }}</span>
                  </div>
                  <div class="result-item">
                    <span class="result-label">相关系数</span>
                    <span class="result-value">{{ results.corr || '-' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="chart-result">
            <Chart ref="chartRef" :config="configData" :data="results" />
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped lang="scss">
@use '../../../assets/scss/components/card';
@import '../../../assets/scss/components/colors';

.draw-chart-page {
  width: 90%;
  padding-left: 20px;
}

.data-res-content,
.config-data-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
}
.cards-wrapper {
  width: 108%;
}
.config-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  background: rgba(10, 15, 12, 0.92);
  backdrop-filter: blur(12px);
  border-radius: 15px;
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
.configuration-box {
  max-height: 210px;
  flex-direction: row;
  display: flex;
  width: 100%;
  text-align: center;
  justify-content: space-between;
  align-items: stretch;
  flex: 1;
  gap: 16px;
}
.left-config,
.right-config {
  display: flex;
  width: 100%;
  justify-content: space-evenly;
  flex-direction: column;
}
.results-list {
  width: 100%;
}

.res-left,
.res-right {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  gap: 16px;
  flex: 1;
}

.result-box {
  display: flex;
  flex-direction: column;
  height: 700px;
  width: 100%;
  gap: 16px;
}
.chart-result {
  display: flex;
  width: 100%;
  height: 100%;
  text-align: center;
  justify-content: space-between;
  align-items: stretch;
  flex: 1;
}

.results-container {
  flex-direction: row;
  display: flex;
  width: 100%;
  height: 100%;
  text-align: center;
  justify-content: space-between;
  align-items: stretch;
  flex: 1;
  gap: 16px;
}

.data-result {
  display: flex;
  flex-direction: column;
  max-height: 100%;
  background: rgba(10, 15, 12, 0.92);
  backdrop-filter: blur(12px);
  border-radius: 15px;
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

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.35s cubic-bezier(0.2, 0.9, 0.4, 1.1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}
/* ===== 移动端适配 ===== */
@media (max-width: 768px) {
  .draw-chart-page {
    width: 100%;
    padding: 10px;
  }

  /* 整体卡片改为纵向 */
  .cards-wrapper {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  /* 配置区 */
  .configuration-box {
    flex-direction: column;
    gap: 12px;
  }

  .left-config,
  .right-config {
    width: 100%;
    gap: 12px;
  }

  /* 表单优化 */
  .form-row {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  .form-label {
    font-size: 14px;
  }

  .form-input,
  .form-select {
    width: 100%;
    font-size: 16px; // 防止 iOS 自动缩放
    padding: 10px;
  }

  /* 表格横向滚动 */
  :deep(.data-table-wrapper) {
    overflow-x: auto;
  }

  /* 提交按钮 */
  .submit-btn {
    width: 100%;
    padding: 12px;
    font-size: 16px;
  }

  /* 结果区 */
  .result-box {
    height: auto;
  }

  .results-container {
    flex-direction: column;
  }

  .res-left,
  .res-right {
    width: 100%;
  }

  /* 图表高度控制 */
  .chart-result {
    height: 300px;
  }
}
</style>
