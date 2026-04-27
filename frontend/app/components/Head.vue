<script setup lang="ts">
import { onMounted } from 'vue'
import type { ToastFunction } from '~/composables/interface/toast'
const toast = inject<ToastFunction>('toast')
onMounted(() => {
  toast?.('欢迎来到PhyPlot', { type: 'success' })
})
</script>

<template>
  <header class="app-header">
    <div class="header-container">
      <div class="logo-area">
        <h1 class="title">PhyPlot</h1>
        <span class="subtitle">physics</span>
      </div>
      <nav class="nav-links">
        <a
          href="https://github.com/Skrepy0/PhyPlot"
          target="_blank"
          rel="noopener noreferrer"
          class="nav-btn"
          tooltip="GitHub"
          data-position="bottom"
        >
          <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
            <path
              d="M64 512c0 195.2 124.8 361.6 300.8 422.4 22.4 6.4 19.2-9.6 19.2-22.4v-76.8c-134.4 16-140.8-73.6-150.4-89.6-19.2-32-60.8-38.4-48-54.4 32-16 64 3.2 99.2 57.6 25.6 38.4 76.8 32 105.6 25.6 6.4-22.4 19.2-44.8 35.2-60.8-144-22.4-201.6-108.8-201.6-211.2 0-48 16-96 48-131.2-22.4-60.8 0-115.2 3.2-121.6 57.6-6.4 118.4 41.6 124.8 44.8 32-9.6 70.4-12.8 112-12.8 41.6 0 80 6.4 112 12.8 12.8-9.6 67.2-48 121.6-44.8 3.2 6.4 25.6 57.6 6.4 118.4 32 38.4 48 83.2 48 131.2 0 102.4-57.6 188.8-201.6 214.4 22.4 22.4 38.4 54.4 38.4 92.8v112c0 9.6 0 19.2 16 19.2C832 876.8 960 710.4 960 512c0-246.4-201.6-448-448-448S64 265.6 64 512z"
              fill="currentColor"
            ></path>
          </svg>
        </a>
      </nav>
    </div>
  </header>
</template>

<style scoped lang="scss">
@import '../../assets/scss/_modern-theme.scss';

.app-header {
  left: 0;
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 100;
  background: var(--glass-bg);
  box-shadow: var(--shadow-primary);
  backdrop-filter: blur(var(--blur-strength));
  border-bottom: 1px solid var(--glass-border);
  transition: var(--transition-normal);
}

.header-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.logo-area {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.title {
  font-size: 1.75rem;
  font-weight: 600;
  background: linear-gradient(135deg, var(--primary-green), var(--accent-blue));
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  letter-spacing: -0.5px;
  margin: 0;
  line-height: 1.2;
}

.subtitle {
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-weight: 400;
  background: var(--glass-bg);
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  backdrop-filter: blur(var(--blur-strength));
  border: 1px solid var(--glass-border);
}

.nav-links {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.nav-btn {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 32px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  cursor: pointer;
  color: var(--text-primary);
  transition: var(--transition-normal);
  // 移除backdrop-filter，避免影响tooltip

  &:hover {
    background: var(--primary-green-light);
    border-color: var(--primary-green);
    transform: translateY(-1px);
    box-shadow: var(--shadow-glow);
  }

  &:active {
    transform: translateY(1px);
  }
}
</style>
