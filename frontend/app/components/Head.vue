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
.app-header {
  left: 0;
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 100;
  background: linear-gradient(135deg, #1a2a3a 0%, #0f1a24 100%);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.header-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0.75rem 2rem;
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
  background: linear-gradient(135deg, #e0f2fe 0%, #a5f3c3 100%);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  letter-spacing: -0.5px;
  margin: 0;
  line-height: 1.2;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.subtitle {
  font-size: 0.85rem;
  color: #94a3b8;
  font-weight: 400;
  background: rgba(255, 255, 255, 0.05);
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  backdrop-filter: blur(4px);
}

.nav-links {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.nav-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 32px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  cursor: pointer;
  color: #e2e8f0;
  transition: all 0.2s ease;
  backdrop-filter: blur(4px);

  &:hover {
    background: rgba(65, 153, 114, 0.6);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: translateY(1px);
  }
}
</style>
