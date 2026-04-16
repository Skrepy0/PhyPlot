<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import ToggleSwitch from './ToggleSwitch.vue'
import Checkbox from './Checkbox.vue'
import { useTheme } from '~/composables/theme'

const props = defineProps({
  show: Boolean,
})

// 主题系统
const { currentTheme, effectiveTheme, toggleTheme, setTheme, getThemeIcon, getThemeName } = useTheme()

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
          <div class="setting-info" tooltip="切换应用程序的整体主题样式">
            <span class="setting-label">界面主题</span>
            <span class="setting-desc">当前: {{ getThemeName(effectiveTheme) }}</span>
          </div>
          <ToggleSwitch
            :modelValue="effectiveTheme === 'dark'"
            @update:modelValue="(val) => setTheme(val ? 'dark' : 'light')"
          />
        </div>
        <div class="setting-item">
          <div class="setting-info" tooltip="开启后,添加x,y数据点并提交后,自动聚焦到x值的输入框,方便下次输入">
            <span class="setting-label">自动聚焦</span>
            <span class="setting-desc">自动聚焦到x值的输入框</span>
          </div>
          <ToggleSwitch v-model="settings.autoFocus" />
        </div>
        <div class="setting-item">
          <div class="setting-info" tooltip="切换图表的亮色/暗色主题">
            <span class="setting-label">图表暗色模式</span>
            <span class="setting-desc">图表生成时使用暗色背景</span>
          </div>
          <ToggleSwitch v-model="settings.chartDarkMode" />
        </div>
        <div class="setting-item">
          <div class="setting-info" tooltip="图表背景显示网格线，便于观察">
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
@import '../../../assets/scss/_modern-theme.scss';

.settings-panel {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--blur-strength));
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-primary);
  padding: 24px;
  width: 100%;
  overflow-y: auto;
  margin: 0 auto;
  max-height: 80vh;
  transition: var(--transition-normal);

  &:hover {
    border-color: var(--border-primary);
    box-shadow: var(--shadow-primary), var(--shadow-glow);
  }

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

}

.setting-label {
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-primary);
}

.setting-desc {
  font-size: 0.8rem;
  color: var(--text-secondary);
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
