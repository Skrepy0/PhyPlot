<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import ToggleSwitch from './ToggleSwitch.vue'
import Checkbox from './Checkbox.vue'

const props = defineProps({
  show: Boolean,
})

const settings = reactive({
  chartDarkMode: false,
  showGrid: true,
  autoFocus: true,
})

const saveSettings = () => {
  localStorage.setItem('userSettings', JSON.stringify(settings))
  window.dispatchEvent(new CustomEvent('settings-updated', { detail: settings }))
}

const loadSettings = () => {
  const saved = localStorage.getItem('userSettings')
  if (saved) {
    try {
      Object.assign(settings, JSON.parse(saved))
    } catch (e) {}
  }
}
watch(
  settings,
  () => {
    saveSettings()
  },
  { deep: true }
)

onMounted(() => {
  loadSettings()
})
</script>

<template>
  <Transition name="fade-up">
    <div v-if="show" class="settings-panel">
      <h2 class="card-title">图表设置</h2>

      <div class="settings-group">
        <div class="setting-item">
          <div class="setting-info" data-tooltip="开启后,添加x,y数据点并提交后,自动聚焦到x值的输入框,方便下次输入">
            <span class="setting-label">自动聚焦</span>
            <span class="setting-desc">自动聚焦到x值的输入框</span>
          </div>
          <ToggleSwitch v-model="settings.autoFocus" />
        </div>
        <div class="setting-item">
          <div class="setting-info" data-tooltip="切换图表的亮色/暗色主题">
            <span class="setting-label">图表暗色模式</span>
            <span class="setting-desc">图表生成时使用暗色背景</span>
          </div>
          <ToggleSwitch v-model="settings.chartDarkMode" />
        </div>
        <div class="setting-item">
          <div class="setting-info" data-tooltip="图表背景显示网格线，便于观察">
            <span class="setting-label">显示网格</span>
            <span class="setting-desc">图表中显示辅助网格线</span>
          </div>
          <ToggleSwitch v-model="settings.showGrid" />
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped lang="scss">
@import '../../../assets/scss/components/card.scss';
@import '../../../assets/scss/components/colors.scss';

.settings-panel {
  background: rgba(20, 26, 23, 0.6);
  backdrop-filter: blur(12px);
  border-radius: 24px;
  padding: 24px;
  border: 1px solid rgba(46, 204, 113, 0.2);
  box-shadow: $shadow;
  width: 100%;
  overflow-y: auto;
  margin: 0 auto;
  max-height: 80vh;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(46, 204, 113, 0.5);
    border-radius: 10px;
    transition: background 0.2s;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(46, 204, 113, 0.8);
  }

  scrollbar-width: thin;
  scrollbar-color: rgba(46, 204, 113, 0.5) rgba(255, 255, 255, 0.05);
}

.settings-group {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin: 24px 0;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid rgba(46, 204, 113, 0.15);
}

.setting-info {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 4px;
  cursor: help;

  // 自定义 tooltip 样式
  &::after {
    content: attr(data-tooltip);
    position: absolute;
    bottom: 100%;
    left: 0;
    transform: translateY(-8px);
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(8px);
    color: white;
    padding: 6px 12px;
    border-radius: 12px;
    font-size: 12px;
    white-space: nowrap;
    z-index: 10;
    pointer-events: none;
    opacity: 0;
    transition:
      opacity 0.2s ease,
      transform 0.2s ease;
    font-weight: 400;
    border: 1px solid rgba(46, 204, 113, 0.4);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  &:hover::after {
    opacity: 1;
    transform: translateY(-12px);
  }
}

.setting-label {
  font-size: 1rem;
  font-weight: 500;
  color: $text-primary;
}

.setting-desc {
  font-size: 0.8rem;
  color: $text-secondary;
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

// 入场动画
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
