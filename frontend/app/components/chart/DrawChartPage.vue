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
  solve(results, configData, lineData.value)
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
        <!-- 左侧：配置 -->
        <div class="config-card">
          <h2 class="card-title">数据配置</h2>

          <div class="config-data-content">
            <!-- 表单 -->
            <div class="form-section">
              <div class="configuration-box">
                <div class="left-config">
                  <div class="form-row">
                    <label class="form-label">表头</label>
                    <input class="form-input" v-model="configData.chartTitle" />
                  </div>

                  <div class="form-row">
                    <label class="form-label">拟合方式</label>
                    <select v-model="configData.draftingMethod" class="form-select">
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
                    <select v-model="configData.errorDistribution" class="form-select">
                      <option v-for="opt in errorDistributionOptions" :key="opt">
                        {{ opt }}
                      </option>
                    </select>
                  </div>

                  <div class="form-row">
                    <label class="form-label">误差限</label>
                    <input type="number" v-model.number="configData.marginError" class="form-input" />
                  </div>
                </div>

                <div class="right-config">
                  <div class="form-row">
                    <label class="form-label">有效数字</label>
                    <input type="number" v-model.number="configData.significantDigits" class="form-input" />
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
            </div>

            <!-- 表格 -->
            <div class="table-section">
              <DataTable variable-type="double" v-model="lineData" />
            </div>

            <!-- 按钮 -->
            <div class="submit-btn-container">
              <button class="submit-btn" @click="submit">完成</button>
            </div>
          </div>
        </div>

        <!-- 右侧：结果 -->
        <div class="result-box">
          <div class="data-result">
            <h2 class="card-title">统计</h2>

            <div class="results-container">
              <div class="results-list">
                <div class="result-item">
                  <span>斜率k</span>
                  <span>{{ results.k || '-' }}</span>
                </div>
                <div class="result-item">
                  <span>截距m</span>
                  <span>{{ results.m || '-' }}</span>
                </div>
                <div class="result-item">
                  <span>y标准误差</span>
                  <span>{{ results.yStdErr || '-' }}</span>
                </div>
              </div>

              <div class="results-list">
                <div class="result-item">
                  <span>k误差</span>
                  <span>{{ results.kStdErr || '-' }}</span>
                </div>
                <div class="result-item">
                  <span>m误差</span>
                  <span>{{ results.mStdErr || '-' }}</span>
                </div>
                <div class="result-item">
                  <span>相关系数</span>
                  <span>{{ results.corr || '-' }}</span>
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
  width: 100%;
  padding: 16px;
}

.cards-wrapper {
  display: flex;
  gap: 16px;
  width: 100%;
}

.config-card {
  background: rgba(10, 15, 12, 0.92);
  backdrop-filter: blur(12px);
  border-radius: 15px;
  border: 1px solid rgba(46, 204, 113, 0.3);
  box-shadow: $shadow;
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
}

/* 三层结构 */
.config-data-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 12px;
}

/* 表单 */
.form-section {
  flex-shrink: 0;
}

/* 表格（核心） */
.table-section {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

/* 按钮 */
.submit-btn-container {
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  padding-top: 10px;
}

/* ===== 右侧结果 ===== */
.result-box {
  background: rgba(10, 15, 12, 0.92);
  backdrop-filter: blur(12px);
  border-radius: 15px;
  border: 1px solid rgba(46, 204, 113, 0.3);
  box-shadow: $shadow;
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  color: #b0b0b0;
}

.chart-result {
  flex: 1;
  min-height: 300px;
}

/* ===== 配置区 ===== */
.configuration-box {
  display: flex;
  gap: 16px;
}

.left-config,
.right-config {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* ===== 结果区 ===== */
.results-container {
  display: flex;
  gap: 12px;
}

.results-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* ===== 移动端 ===== */
@media (max-width: 768px) {
  .cards-wrapper {
    flex-direction: column;
  }

  .configuration-box {
    flex-direction: column;
  }

  /* 表格横向滚动 */
  .table-section {
    overflow-x: auto;
    overflow-y: visible;
  }

  /* ⭐按钮吸底 */
  .submit-btn-container {
    position: sticky;
    bottom: 0;
    background: rgba(10, 15, 12, 0.95);
    padding: 12px;
    z-index: 10;
    max-width: 140px;
    text-align: center;
    margin: 0 auto;
  }

  .submit-btn {
    width: 100%;
    text-align: center;
  }

  .chart-result {
    height: 260px;
  }
}
</style>
