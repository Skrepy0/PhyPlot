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
      <nav class="nav-links"></nav>
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
  backdrop-filter: blur(var(--blur-strength));

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
