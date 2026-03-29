<script setup lang="ts">
import { ref } from 'vue'
import DataTable from '~/components/data-components/DataTable.vue'
import type { SingleResult } from '~/composables/interface/single-result'
import SideBar from '~/components/SideBar.vue'
import { solve } from '~/composables/solve-data/single-data'
const props = defineProps({
  show: Boolean,
})

const confidenceOptions = ['68.3%', '95.4%', '99.7%']
const selectedConfidence = ref('95.4%')
const significantDigits = ref(4)

const singleData = ref([])
console.log(singleData.value)
const results = ref<SingleResult>({
  count: 0,
  variance: 0,
  stdErr: 0,
  meanStdDev: 0,
  mean: 0,
  stdDev: 0,
  uncertainty: 0,
  confidenceInterval: [0, 0],
})

const formatNumber = (v: number) => v.toFixed(significantDigits.value)
const submit = () => {
  solve(results)
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
              <label class="form-label">有效数字</label>
              <input
                type="number"
                v-model.number="significantDigits"
                class="form-input"
                min="1"
                max="10"
              />
            </div>

            <!-- 表格区域（核心优化） -->

            <DataTable v-model="singleData" variable-type="single" />
            <div class="submit-btn-container">
              <button type="submit" class="submit-btn" @click="submit">
                开始统计
              </button>
            </div>
          </div>
        </div>

        <!-- 右侧 -->
        <div class="result-card">
          <h2 class="card-title">处理结果</h2>

          <div class="results-list">
            <div class="result-item">
              <span class="result-label">数据总数n</span>
              <span class="result-value">
                {{ results ? formatNumber(results?.count) : '-' }}
              </span>
            </div>
            <div class="result-item">
              <span class="result-label">算术平均值</span>
              <span class="result-value">
                {{ results ? formatNumber(results?.mean) : '-' }}
              </span>
            </div>
            <div class="result-item">
              <span class="result-label">方差</span>
              <span class="result-value">
                {{ results ? formatNumber(results?.variance) : '-' }}
              </span>
            </div>
            <div class="result-item">
              <span class="result-label">标准误差</span>
              <span class="result-value">
                {{ results ? formatNumber(results?.stdErr) : '-' }}
              </span>
            </div>
            <div class="result-item">
              <span class="result-label">样本标准差</span>
              <span class="result-value">
                {{ results ? formatNumber(results?.stdDev) : '-' }}
              </span>
            </div>
            <div class="result-item">
              <span class="result-label">均值标准差</span>
              <span class="result-value">
                {{ results ? formatNumber(results?.meanStdDev) : '-' }}
              </span>
            </div>
            <div class="result-item">
              <span class="result-label">A类不确定度</span>
              <span class="result-value">
                {{ results ? formatNumber(results?.uncertainty) : '-' }}
              </span>
            </div>

            <div class="result-item">
              <span class="result-label">
                {{ selectedConfidence }} 置信区间
              </span>
              <span class="result-value">
                [{{
                  results ? formatNumber(results?.confidenceInterval[0]) : '-'
                }},
                {{
                  results ? formatNumber(results?.confidenceInterval[1]) : '-'
                }}]
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped lang="scss">
$bg-dark: #0a0f0c;
$bg-surface: #141a17;
$border-green: #2ecc71;
$text-primary: #e0e0e0;
$text-secondary: #b0b0b0;
$accent-green: #27ae60;
$accent-hover: #2ecc71;
$input-bg: #1e2522;
$shadow: 0 8px 20px rgba(0, 0, 0, 0.5);

.us-container {
  width: 100%;
  padding-left: 20px;
}

/* ================= 布局 ================= */

.cards-wrapper {
  display: flex;
  gap: 24px;
  width: 100%;
  padding: 20px 0;
}

/* 左右比例优化 */
.config-card {
  flex: 1.2;
}

.result-card {
  flex: 0.8;
}

/* 卡片统一 */
.config-card,
.result-card {
  display: flex;
  flex-direction: column;
  height: 600px;
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

/* ================= 标题 ================= */

.card-title {
  font-size: 1.5rem;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(46, 204, 113, 0.4);
  color: $accent-green;
}

/* ================= 表单 ================= */

.config-data-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
}

.form-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.form-label {
  width: 100px;
  color: $text-secondary;
}

.form-select,
.form-input {
  flex: 1;
  background: $input-bg;
  border: 1px solid rgba(46, 204, 113, 0.3);
  border-radius: 8px;
  padding: 8px 12px;
  color: $text-primary;

  &:focus {
    border-color: $accent-green;
    box-shadow: 0 0 0 2px rgba(46, 204, 113, 0.2);
  }
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

/* 让 DataTable 填满 */
.table-container :deep(.data-table-container) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 表格滚动 */
.table-container :deep(.table-wrapper) {
  flex: 1;
  overflow-y: auto;
}

/* 添加区固定底部 */
.table-container :deep(.add-form) {
  margin-top: auto;
}

.results-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 16px;
}

.result-item {
  background: rgba(30, 37, 34, 0.6);
  padding: 12px 16px;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  border: 1px solid rgba(46, 204, 113, 0.2);

  &:hover {
    border-color: $accent-green;
    transform: translateX(4px);
  }
}

.result-label {
  color: $text-secondary;
}

.result-value {
  color: $accent-hover;
  font-family: monospace;
  font-size: 1.1rem;
}
.submit-btn-container {
  display: flex;
  justify-content: center;
}

.submit-btn {
  background: linear-gradient(135deg, #2ecc71, #27ae60);
  border: none;
  border-radius: 40px;
  padding: 12px 32px;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  display: inline-flex;
  align-items: center;
  gap: 8px;

  // 可选：添加一个提交图标（使用伪元素或背景图）
  &::before {
    content: '✓';
    font-size: 1.2rem;
    font-weight: bold;
    transition: transform 0.2s;
  }

  &:hover {
    background: linear-gradient(135deg, #27ae60, #1e8f5e);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
  }

  &:active {
    transform: translateY(1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
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
</style>
