<script setup lang="ts">
import DataTable from '~/components/data-components/DataTable.vue'
import { inject, ref } from 'vue'
import Chart from '~/components/chart/Chart.vue'
import { solve, solveExponential, solveLogistic } from '~/composables/solve-data/double-data'
import { verifyDataPoints } from '~/composables/tools'
import { copy } from '~/composables/tools'
import type { ToastFunction } from '~/composables/interface/toast'
import type { ChartData } from '~/composables/interface/chart-data'
import type { DoubleResult, ExponentialResult, LogisticResult, FitLine } from '~/composables/interface/double-result'
const props = defineProps({
  show: Boolean,
})
const confidenceOptions = ['68.3%', '95%', '99.7%']
const errorDistributionOptions = ['均匀分布', '三角分布', '正态分布']
const toast = inject<ToastFunction>('toast')
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

const fitLines = ref<FitLine[]>([])
const nextLineId = ref(1)
const selectedLineId = ref<number | null>(null)
const copyValue = async (val: string | number): Promise<void> => {
  copy(val, toast)
}
const submit = async () => {
  // 如果没有拟合线，提示用户添加
  if (fitLines.value.length === 0) {
    toast?.('请至少添加一条拟合线', { type: 'warning' })
    return
  }

  // 检查所有拟合线是否都有足够的数据
  const incompleteLines = fitLines.value.filter((line) => line.data.length < 2)
  if (incompleteLines.length > 0) {
    toast?.('所有拟合线至少需要2个数据点', { type: 'warning' })
    return
  }

  // 检查重复的x值
  for (const line of fitLines.value) {
    if (!verifyDataPoints(line.data)) {
      toast?.(`拟合线"${line.name}"存在重复的x值!`, { type: 'error' })
      return
    }
  }

  try {
    // 计算所有拟合线的结果
    for (const line of fitLines.value) {
      if (line.type === 'linear') {
        const tempResult = ref<DoubleResult>({
          k: '',
          m: '',
          yStdErr: '',
          kStdErr: '',
          mStdErr: '',
          corr: '',
        })
        await solve(tempResult, configData, line.data)
        line.result = tempResult.value
      } else if (line.type === 'exponential') {
        const tempResult = ref<ExponentialResult>({
          a: '',
          b: '',
          c: '',
          aStdErr: '',
          bStdErr: '',
          corr: '',
          yStdErr: '',
        })
        await solveExponential(tempResult, configData, line.data)
        line.result = tempResult.value
      } else if (line.type === 'logistic') {
        const tempResult = ref<LogisticResult>({
          L: '',
          k: '',
          x0: '',
          LStdErr: '',
          kStdErr: '',
          x0StdErr: '',
          corr: '',
          yStdErr: '',
        })
        await solveLogistic(tempResult, configData, line.data)
        line.result = tempResult.value
      }
    }

    if (chartRef.value && fitLines.value.length > 0) {
      // 使用第一条拟合线作为主要显示，并传入所有拟合线
      const mainLine = fitLines.value[0]
      if (mainLine) {
        if (mainLine.type === 'linear') {
          await solve(results, configData, mainLine.data)
        } else if (mainLine.type === 'exponential') {
          const expResult = ref<ExponentialResult>({
            a: '',
            b: '',
            c: '',
            aStdErr: '',
            bStdErr: '',
            corr: '',
            yStdErr: '',
          })
          await solveExponential(expResult, configData, mainLine.data)
          results.value = {
            k: expResult.value.b,
            m: expResult.value.a,
            yStdErr: expResult.value.yStdErr,
            kStdErr: expResult.value.bStdErr,
            mStdErr: expResult.value.aStdErr,
            corr: expResult.value.corr,
          }
        } else if (mainLine.type === 'logistic') {
          const logisticResult = ref<LogisticResult>({
            L: '',
            k: '',
            x0: '',
            LStdErr: '',
            kStdErr: '',
            x0StdErr: '',
            corr: '',
            yStdErr: '',
          })
          await solveLogistic(logisticResult, configData, mainLine.data)
          // 对于逻辑拟合，我们使用k参数作为主要斜率显示
          results.value = {
            k: logisticResult.value.k,
            m: logisticResult.value.L,
            yStdErr: logisticResult.value.yStdErr,
            kStdErr: logisticResult.value.kStdErr,
            mStdErr: logisticResult.value.LStdErr,
            corr: logisticResult.value.corr,
          }
        }

        chartRef.value.loadChart(results.value, configData.value, mainLine.data, fitLines.value)
        console.log('图表已刷新')
      }
    }
  } catch (error) {
    toast?.(`计算失败: ${error instanceof Error ? error.message : '未知错误'}`, { type: 'error' })
  }
}

const addFitLine = () => {
  const newLine: FitLine = {
    id: nextLineId.value++,
    type: 'linear',
    name: `拟合线${nextLineId.value - 1}`,
    data: [],
    result: null,
    color: `#${Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, '0')}`,
    legend: `拟合线${nextLineId.value - 1}`,
    pointLegend: '数据点',
    drawLinearRegionFittingLine: false,
  }
  fitLines.value.push(newLine)
  selectedLineId.value = newLine.id
  toast?.('已添加新拟合线', { type: 'success' })
}

const removeFitLine = (id: number) => {
  const index = fitLines.value.findIndex((line) => line.id === id)
  if (index > -1) {
    fitLines.value.splice(index, 1)
    if (selectedLineId.value === id) {
      selectedLineId.value = fitLines.value.length > 0 ? fitLines.value[0]?.id || null : null
    }
    toast?.('已删除拟合线', { type: 'success' })
  }
}

const calculateFitLine = async (line: FitLine) => {
  if (line.data.length < 2) {
    toast?.('至少需要2个数据点才能计算拟合', { type: 'warning' })
    return
  }

  if (!verifyDataPoints(line.data)) {
    toast?.('请检查是否有重复的x值输入!', { type: 'error' })
    return
  }

  try {
    if (line.type === 'linear') {
      const tempResult = ref<DoubleResult>({
        k: '',
        m: '',
        yStdErr: '',
        kStdErr: '',
        mStdErr: '',
        corr: '',
      })
      await solve(tempResult, configData, line.data)
      line.result = tempResult.value
    } else if (line.type === 'exponential') {
      const tempResult = ref<ExponentialResult>({
        a: '',
        b: '',
        c: '',
        aStdErr: '',
        bStdErr: '',
        corr: '',
        yStdErr: '',
      })
      await solveExponential(tempResult, configData, line.data)
      line.result = tempResult.value
    } else if (line.type === 'logistic') {
      const tempResult = ref<LogisticResult>({
        L: '',
        k: '',
        x0: '',
        LStdErr: '',
        kStdErr: '',
        x0StdErr: '',
        corr: '',
        yStdErr: '',
      })
      await solveLogistic(tempResult, configData, line.data)
      line.result = tempResult.value
    }
    toast?.('拟合计算完成', { type: 'success' })
  } catch (error) {
    toast?.(`计算失败: ${error instanceof Error ? error.message : '未知错误'}`, { type: 'error' })
  }
}
</script>

<template>
  <Transition name="fade-up">
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
                    <label class="form-label">小数位数</label>
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
                </div>
              </div>
            </div>

            <!-- 拟合线管理 -->
            <div class="fit-lines-management">
              <div class="fit-lines-header">
                <h3 class="section-title">拟合线管理</h3>
                <button class="add-line-btn" @click="addFitLine">+ 添加拟合线</button>
              </div>

              <div v-if="fitLines.length > 0" class="fit-lines-tabs">
                <div class="fit-lines-tabs-header">
                  <div
                    v-for="line in fitLines"
                    :key="line.id"
                    class="fit-line-tab"
                    :class="{ active: selectedLineId === line.id }"
                    @click="selectedLineId = line.id"
                  >
                    <span class="fit-line-tab-name">{{ line.name }}</span>
                    <button class="remove-line-btn" @click.stop="removeFitLine(line.id)">×</button>
                  </div>
                </div>

                <div v-if="selectedLineId" class="fit-line-configuration">
                  <div v-for="line in fitLines.filter((l) => l.id === selectedLineId)" :key="line.id" class="active-line-config">
                    <div class="config-section">
                      <div class="form-row">
                        <label class="form-label">拟合线名称</label>
                        <input class="form-input" v-model="line.name" />
                      </div>

                      <div class="form-row">
                        <label class="form-label">拟合类型</label>
                        <select v-model="line.type" class="form-select">
                          <option value="linear">线性拟合</option>
                          <option value="exponential">指数拟合</option>
                          <option value="logistic">逻辑拟合</option>
                        </select>
                      </div>

                      <div class="form-row">
                        <label class="form-label">线条颜色</label>
                        <input type="color" v-model="line.color" class="color-picker" />
                      </div>

                      <div class="form-row">
                        <label class="form-label">线图例</label>
                        <input class="form-input" v-model="line.legend" />
                      </div>

                      <div class="form-row">
                        <label class="form-label">点图例</label>
                        <input class="form-input" v-model="line.pointLegend" />
                      </div>
                      <div class="form-row" v-if="line.type !== 'linear'">
                        <label class="form-label">添加线性区域拟合直线</label>
                        <select v-model="line.drawLinearRegionFittingLine" class="form-select">
                          <option value="true">是</option>
                          <option value="false">否</option>
                        </select>
                      </div>
                    </div>

                    <div class="data-section">
                      <h4>数据点配置</h4>
                      <DataTable variable-type="double" v-model="line.data" />
                    </div>

                    <div class="calculation-section">
                      <button class="calculate-btn" @click="calculateFitLine(line)" :disabled="line.data.length < 2">
                        {{ line.result ? '重新计算' : '计算拟合' }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div v-else class="no-fit-lines">
                <p>暂无拟合线，点击"+ 添加拟合线"开始</p>
              </div>
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

            <!-- 拟合线统计结果 -->
            <div v-if="fitLines.length > 0" class="fit-lines-statistics">
              <h3 class="section-title">拟合线统计</h3>

              <!-- 拟合线选择器 -->
              <div class="fit-line-selector">
                <label class="form-label">选择拟合线查看统计:</label>
                <select v-model="selectedLineId" class="form-select">
                  <option v-for="line in fitLines" :key="line.id" :value="line.id">
                    {{ line.name }} ({{ line.type === 'linear' ? '线性' : line.type === 'exponential' ? '指数' : '逻辑' }})
                  </option>
                </select>
              </div>

              <!-- 统计结果显示 -->
              <div v-if="selectedLineId" class="statistics-content">
                <!-- 拟合线统计 -->
                <div class="additional-line-statistics">
                  <div v-for="line in fitLines.filter((l) => l.id === selectedLineId)" :key="line.id">
                    <h4>{{ line.name }} 统计结果</h4>
                    <div v-if="line.result" class="results-container">
                      <div class="results-list">
                        <template v-if="line.type === 'linear'">
                          <div class="result-item" @click="copyValue((line.result as DoubleResult).k)">
                            <span class="result-label">斜率k</span>
                            <span class="result-value" :title="(line.result as DoubleResult).k">
                              {{ (line.result as DoubleResult).k || '-' }}
                            </span>
                          </div>
                          <div class="result-item" @click="copyValue((line.result as DoubleResult).m)">
                            <span class="result-label">截距m</span>
                            <span class="result-value" :title="(line.result as DoubleResult).m">
                              {{ (line.result as DoubleResult).m || '-' }}
                            </span>
                          </div>
                          <div class="result-item" @click="copyValue((line.result as DoubleResult).yStdErr)">
                            <span class="result-label">标准误差</span>
                            <span class="result-value" :title="(line.result as DoubleResult).yStdErr">
                              {{ (line.result as DoubleResult).yStdErr || '-' }}
                            </span>
                          </div>
                        </template>
                        <template v-else-if="line.type === 'logistic'">
                          <div class="result-item" @click="copyValue((line.result as LogisticResult).L)">
                            <span class="result-label">最大渐近值L</span>
                            <span class="result-value" :title="(line.result as LogisticResult).L">
                              {{ (line.result as LogisticResult).L || '-' }}
                            </span>
                          </div>
                          <div class="result-item" @click="copyValue((line.result as LogisticResult).k)">
                            <span class="result-label">增长率k</span>
                            <span class="result-value" :title="(line.result as LogisticResult).k">
                              {{ (line.result as LogisticResult).k || '-' }}
                            </span>
                          </div>
                          <div class="result-item" @click="copyValue((line.result as LogisticResult).x0)">
                            <span class="result-label">中点位置x₀</span>
                            <span class="result-value" :title="(line.result as LogisticResult).x0">
                              {{ (line.result as LogisticResult).x0 || '-' }}
                            </span>
                          </div>
                          <div class="result-item" @click="copyValue((line.result as LogisticResult).yStdErr)">
                            <span class="result-label">标准误差</span>
                            <span class="result-value" :title="(line.result as LogisticResult).yStdErr">
                              {{ (line.result as LogisticResult).yStdErr || '-' }}
                            </span>
                          </div>
                        </template>
                        <template v-else>
                          <div class="result-item" @click="copyValue((line.result as ExponentialResult).a)">
                            <span class="result-label">系数a</span>
                            <span class="result-value" :title="(line.result as ExponentialResult).a">
                              {{ (line.result as ExponentialResult).a || '-' }}
                            </span>
                          </div>
                          <div class="result-item" @click="copyValue((line.result as ExponentialResult).b)">
                            <span class="result-label">指数b</span>
                            <span class="result-value" :title="(line.result as ExponentialResult).b">
                              {{ (line.result as ExponentialResult).b || '-' }}
                            </span>
                          </div>
                          <div class="result-item" @click="copyValue((line.result as ExponentialResult).yStdErr)">
                            <span class="result-label">标准误差</span>
                            <span class="result-value" :title="(line.result as ExponentialResult).yStdErr">
                              {{ (line.result as ExponentialResult).yStdErr || '-' }}
                            </span>
                          </div>
                        </template>
                      </div>

                      <div class="results-list">
                        <template v-if="line.type === 'linear'">
                          <div class="result-item" @click="copyValue((line.result as DoubleResult).kStdErr)">
                            <span class="result-label">k误差</span>
                            <span class="result-value" :title="(line.result as DoubleResult).kStdErr">
                              {{ (line.result as DoubleResult).kStdErr || '-' }}
                            </span>
                          </div>
                          <div class="result-item" @click="copyValue((line.result as DoubleResult).mStdErr)">
                            <span class="result-label">m误差</span>
                            <span class="result-value" :title="(line.result as DoubleResult).mStdErr">
                              {{ (line.result as DoubleResult).mStdErr || '-' }}
                            </span>
                          </div>
                        </template>
                        <template v-else-if="line.type === 'logistic'">
                          <div class="result-item" @click="copyValue((line.result as LogisticResult).LStdErr)">
                            <span class="result-label">L误差</span>
                            <span class="result-value" :title="(line.result as LogisticResult).LStdErr">
                              {{ (line.result as LogisticResult).LStdErr || '-' }}
                            </span>
                          </div>
                          <div class="result-item" @click="copyValue((line.result as LogisticResult).kStdErr)">
                            <span class="result-label">k误差</span>
                            <span class="result-value" :title="(line.result as LogisticResult).kStdErr">
                              {{ (line.result as LogisticResult).kStdErr || '-' }}
                            </span>
                          </div>
                          <div class="result-item" @click="copyValue((line.result as LogisticResult).x0StdErr)">
                            <span class="result-label">x₀误差</span>
                            <span class="result-value" :title="(line.result as LogisticResult).x0StdErr">
                              {{ (line.result as LogisticResult).x0StdErr || '-' }}
                            </span>
                          </div>
                        </template>
                        <template v-else>
                          <div class="result-item" @click="copyValue((line.result as ExponentialResult).aStdErr)">
                            <span class="result-label">a误差</span>
                            <span class="result-value" :title="(line.result as ExponentialResult).aStdErr">
                              {{ (line.result as ExponentialResult).aStdErr || '-' }}
                            </span>
                          </div>
                          <div class="result-item" @click="copyValue((line.result as ExponentialResult).bStdErr)">
                            <span class="result-label">b误差</span>
                            <span class="result-value" :title="(line.result as ExponentialResult).bStdErr">
                              {{ (line.result as ExponentialResult).bStdErr || '-' }}
                            </span>
                          </div>
                        </template>
                        <div class="result-item" @click="copyValue(line.result.corr)">
                          <span class="result-label">相关系数</span>
                          <span class="result-value" :title="line.result.corr">
                            {{ line.result.corr || '-' }}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div v-else class="no-results">
                      <p>请先计算该拟合线</p>
                    </div>
                  </div>
                </div>
              </div>

              <div v-else class="no-fit-lines-message">
                <p>请添加拟合线以查看统计结果</p>
              </div>
            </div>

            <div class="chart-result">
              <Chart ref="chartRef" :config="configData" :data="results" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped lang="scss">
@use '../../../assets/scss/components/card';
@import '../../../assets/scss/_modern-theme.scss';

.draw-chart-page {
  width: 100%;
  padding: 20px;
}

.cards-wrapper {
  display: flex;
  gap: 20px;
  width: 100%;
}

.config-card {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--blur-strength));
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-primary);
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 24px;
  transition: var(--transition-normal);

  &:hover {
    border-color: var(--border-primary);
    box-shadow: var(--shadow-primary), var(--shadow-glow);
  }
}

/* 三层结构 */
.config-data-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 16px;
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
  padding-top: 16px;
}

.submit-btn {
  padding: 14px 28px;
  background: linear-gradient(135deg, var(--primary-green), var(--primary-green-dark));
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 16px;
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
    box-shadow: 0 8px 24px rgba(46, 204, 113, 0.3);
  }

  &:hover::before {
    left: 100%;
  }

  &:active {
    transform: translateY(0);
  }
}

/* 拟合线管理样式 */
.fit-lines-management {
  margin-top: 20px;
  padding: 20px;
  background: rgba(46, 204, 113, 0.05);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-secondary);
}

.fit-lines-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  color: var(--text-accent);
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.add-line-btn {
  padding: 10px 20px;
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
}

/* 全局表单样式 */
.form-input,
.form-select {
  background: var(--glass-bg);
  border: 1px solid var(--border-secondary);
  color: var(--text-primary);
  border-radius: var(--radius-md);
  padding: 10px 14px;
  font-size: 14px;
  transition: var(--transition-normal);
  option {
    background-color: var(--glass-bg);
  }
  &:focus {
    outline: none;
    border-color: var(--primary-green);
    box-shadow: 0 0 0 3px rgba(46, 204, 113, 0.1);
    background: rgba(255, 255, 255, 0.08);
  }

  &:hover {
    border-color: var(--border-primary);
    background: rgba(255, 255, 255, 0.05);
  }

  &::placeholder {
    color: var(--text-muted);
  }
}

.form-select {
  cursor: pointer;
  margin: 0.5rem;
  background-position: right 12px center;
  background-repeat: no-repeat;
  background-size: 16px;
  padding-right: 40px;
}

.fit-lines-tabs {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.fit-lines-tabs-header {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  border-bottom: 1px solid rgba(46, 204, 113, 0.2);
  padding-bottom: 8px;
}

.fit-line-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(46, 204, 113, 0.2);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.fit-line-tab:hover {
  border-color: rgba(46, 204, 113, 0.4);
  background: rgba(0, 0, 0, 0.3);
}

.fit-line-tab.active {
  border-color: rgba(46, 204, 113, 0.6);
  background: rgba(46, 204, 113, 0.1);
}

.fit-line-tab-name {
  color: rgba(46, 204, 113, 0.9);
  font-weight: 500;
  font-size: 14px;
}

.remove-line-btn {
  background: none;
  border: none;
  color: #dc3545;
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.remove-line-btn:hover {
  background: rgba(220, 53, 69, 0.1);
  transform: scale(1.1);
}

.fit-line-configuration {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 16px;
}

.active-line-config {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.config-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.config-section .form-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.config-section .form-label {
  min-width: 80px;
  color: rgba(46, 204, 113, 0.9);
  font-weight: 500;
}

.config-section .form-input,
.config-section .form-select {
  flex: 1;
  background: var(--glass-bg);
  border: 1px solid var(--border-secondary);
  color: var(--text-primary);
  border-radius: var(--radius-md);
  padding: 10px 14px;
  font-size: 14px;
  transition: var(--transition-normal);

  &:focus {
    outline: none;
    border-color: var(--primary-green);
    box-shadow: 0 0 0 3px rgba(46, 204, 113, 0.1);
    background: rgba(255, 255, 255, 0.08);
  }

  &:hover {
    border-color: var(--border-primary);
    background: rgba(255, 255, 255, 0.05);
  }

  &::placeholder {
    color: var(--text-muted);
  }
}

.color-picker {
  width: 40px;
  height: 30px;
  border: 1px solid rgba(46, 204, 113, 0.3);
  border-radius: 4px;
  cursor: pointer;
}

.data-section h4 {
  color: rgba(46, 204, 113, 0.9);
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
}

.calculation-section {
  display: flex;
  justify-content: center;
}

.calculate-btn {
  padding: 8px 16px;
  background: rgba(46, 204, 113, 0.2);
  color: rgba(46, 204, 113, 0.9);
  border: 1px solid rgba(46, 204, 113, 0.3);
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.calculate-btn:hover:not(:disabled) {
  background: rgba(46, 204, 113, 0.3);
  border-color: rgba(46, 204, 113, 0.5);
  transform: translateY(-1px);
}

.calculate-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.no-fit-lines {
  text-align: center;
  color: #888;
  font-style: italic;
  padding: 20px;
}

/* 拟合线统计样式 */
.fit-lines-statistics {
  margin: 1rem;
  margin-top: 16px;
  padding: 16px;
  background: rgba(46, 204, 113, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(46, 204, 113, 0.1);
}

.fit-line-selector {
  margin-bottom: 16px;
}

.fit-line-selector .form-label {
  display: block;
  margin-bottom: 8px;
  color: rgba(46, 204, 113, 0.9);
  font-weight: 500;
}

.fit-line-selector .form-select {
  width: 100%;
  background: var(--glass-bg);
  border: 1px solid var(--border-secondary);
  color: var(--text-primary);
  border-radius: var(--radius-md);
  padding: 10px 14px;
  font-size: 14px;
  transition: var(--transition-normal);

  &:focus {
    outline: none;
    border-color: var(--primary-green);
    box-shadow: 0 0 0 3px rgba(46, 204, 113, 0.1);
    background: rgba(255, 255, 255, 0.08);
  }

  &:hover {
    border-color: var(--border-primary);
    background: rgba(255, 255, 255, 0.05);
  }
}

.statistics-content h4 {
  color: rgba(46, 204, 113, 0.9);
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
}

.no-results {
  text-align: center;
  color: #888;
  font-style: italic;
  padding: 20px;
}

.main-statistics-preview {
  margin-bottom: 16px;
  padding: 12px;
  background: rgba(46, 204, 113, 0.03);
  border-radius: 6px;
  border: 1px solid rgba(46, 204, 113, 0.1);
}

/* ===== 右侧结果 ===== */
.result-box {
  overflow-x: auto;
  background: var(--glass-bg);
  backdrop-filter: blur(var(--blur-strength));
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-primary);
  padding: 24px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  color: var(--text-primary);
  transition: var(--transition-normal);

  &:hover {
    border-color: var(--border-primary);
    box-shadow: var(--shadow-primary), var(--shadow-glow);
  }
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
  overflow-y: auto;
  overflow-x: auto;
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
    background: var(--glass-bg);
    padding: 12px;
    z-index: 10;
    max-width: 140px;
    text-align: center;
    margin: 0 auto;
  }

  .submit-btn {
    width: 100%;
    text-align: center;
    padding: 14px 28px;
    background: linear-gradient(135deg, var(--primary-green), var(--primary-green-dark));
    color: white;
    border: none;
    border-radius: var(--radius-md);
    font-size: 16px;
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
      box-shadow: 0 8px 24px rgba(46, 204, 113, 0.3);
    }

    &:hover::before {
      left: 100%;
    }

    &:active {
      transform: translateY(0);
    }
  }

  /* 拟合线管理样式 */
  .fit-lines-management {
    margin-top: 16px;
    padding: 16px;
    background: rgba(46, 204, 113, 0.05);
    border-radius: 8px;
    border: 1px solid rgba(46, 204, 113, 0.1);
  }

  .fit-lines-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    flex-wrap: wrap;
    gap: 8px;
  }

  .fit-lines-tabs-header {
    flex-direction: column;
    gap: 4px;
  }

  .fit-line-tab {
    justify-content: space-between;
    width: 100%;
  }

  .config-section .form-row {
    flex-direction: column;
    align-items: stretch;
    gap: 4px;
  }

  .config-section .form-label {
    min-width: auto;
  }

  .data-section {
    overflow-x: auto;
  }

  /* 拟合线统计样式 */
  .fit-lines-statistics {
    margin-top: 16px;
    padding: 16px;
    background: rgba(46, 204, 113, 0.05);
    border-radius: 8px;
    border: 1px solid rgba(46, 204, 113, 0.1);
  }

  .fit-line-selector .form-label {
    font-size: 14px;
  }

  .main-statistics-preview {
    padding: 8px;
  }

  .chart-result {
    height: 260px;
  }
}
.fade-up-enter-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.5s;
}

.fade-up-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-up-enter-from,
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
