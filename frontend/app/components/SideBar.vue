<script setup lang="ts">
import { ref } from 'vue'

const showHome = ref(true)
const showSidebar = ref(false)
const showUnivariateStatistics = ref(false)
const showDrawChart = ref(false)
const showSettings = ref(false)
const Pages: Ref[] = [showHome, showDrawChart, showUnivariateStatistics, showSettings]
const showPage = (targetPage: Ref) => {
  Pages.forEach((page) => {
    if (page.value && page !== targetPage) {
      page.value = false
    }
  })
  targetPage.value = true
}
const showUS = () => {
  showPage(showUnivariateStatistics)
}
const showDCP = () => {
  showPage(showDrawChart)
}
const showSs = () => {
  showPage(showSettings)
}
const showHomePage = () => {
  showPage(showHome)
}
setTimeout(() => {
  showSidebar.value = true
}, 500)
defineExpose({
  showUnivariateStatistics,
  showDrawChart,
  showSettings,
  showHome,
})
</script>

<template>
  <Transition name="slide-fade">
    <div class="sidebar-container" v-if="showSidebar">
      <button class="home-btn sidebar-btn" tooltip="Home" data-position="right" @click="showHomePage">
        <svg class="icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="25" height="25">
          <path
            d="M946.5 505L560.1 118.8l-25.9-25.9c-12.3-12.2-32.1-12.2-44.4 0L77.5 505c-12.3 12.3-18.9 28.6-18.8 46 0.4 35.2 29.7 63.3 64.9 63.3h42.5V940h691.8V614.3h43.4c17.1 0 33.2-6.7 45.3-18.8 12.1-12.1 18.7-28.2 18.7-45.3 0-17-6.7-33.1-18.8-45.2zM568 868H456V664h112v204z m217.9-325.7V868H632V640c0-22.1-17.9-40-40-40H432c-22.1 0-40 17.9-40 40v228H238.1V542.3h-96l370-369.7 23.1 23.1L882 542.3h-96.1z"
            fill="currentColor"
          ></path>
        </svg>
      </button>
      <button class="data-point-btn sidebar-btn" tooltip="单变量统计" data-position="right" @click="showUS">
        <svg class="icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="25" height="25">
          <path
            d="M661.333333 128a128 128 0 0 1 82.773334 225.621333l56.832 117.482667a117.333333 117.333333 0 1 1-57.578667 27.882667l-56.832-117.461334a128.618667 128.618667 0 0 1-43.52 1.173334l-133.546667 266.368a128 128 0 1 1-182.186666 16.938666l-103.445334-137.514666a106.666667 106.666667 0 1 1 52.48-36.48l102.293334 135.978666a128.597333 128.597333 0 0 1 73.578666-6.784l131.861334-263.168A128 128 0 0 1 661.333333 128zM426.666667 688.490667a58.176 58.176 0 1 0 0 116.352 58.176 58.176 0 0 0 0-116.352zM821.333333 533.333333a53.333333 53.333333 0 1 0 0 106.666667 53.333333 53.333333 0 0 0 0-106.666667zM192 378.176a48.490667 48.490667 0 1 0 0 96.981333 48.490667 48.490667 0 0 0 0-96.981333z m469.333333-180.352a58.176 58.176 0 1 0 0 116.352 58.176 58.176 0 0 0 0-116.352z"
            fill="currentColor"
          ></path>
        </svg>
      </button>
      <button class="chart-btn sidebar-btn" tooltip="图表" data-position="right" @click="showDCP">
        <svg class="icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="25" height="25">
          <path
            d="M304.128 592.384v158.208a25.6 25.6 0 1 0 51.2 0v-158.208a25.6 25.6 0 1 0-51.2 0zM266.752 439.296L476.16 293.376l124.416 135.68a27.136 27.136 0 0 0 6.656 5.12h18.944a27.136 27.136 0 0 0 7.68-3.584l219.648-153.6a27.648 27.648 0 0 0-31.744-45.568l-204.8 141.824-115.712-134.656a27.648 27.648 0 0 0-35.84-3.584 26.624 26.624 0 0 0-7.168 3.072l-223.232 153.6a27.648 27.648 0 0 0 31.744 45.568zM457.216 484.864v265.728a25.6 25.6 0 1 0 51.2 0V484.864a25.6 25.6 0 1 0-51.2 0zM761.344 484.864v265.728a25.6 25.6 0 1 0 51.2 0V484.864a25.6 25.6 0 1 0-51.2 0zM609.792 592.384v158.208a25.6 25.6 0 1 0 51.2 0v-158.208a25.6 25.6 0 1 0-51.2 0z"
            fill="currentColor"
          ></path>
          <path
            d="M897.536 851.456H288.768a102.4 102.4 0 0 1-102.4-102.4V179.2a25.6 25.6 0 0 0-51.2 0v569.856a153.6 153.6 0 0 0 153.6 153.6h608.768a25.6 25.6 0 1 0 0-51.2z"
            fill="currentColor"
          ></path>
        </svg>
      </button>
      <button class="settings-btn sidebar-btn" tooltip="设置" data-position="right" @click="showSs">
        <svg class="icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="25" height="25">
          <path
            d="M803.84 245.020444q39.537778 22.869333 62.407111 62.464 22.869333 39.594667 22.869333 85.333334v238.364444q0 45.738667-22.869333 85.333334t-62.464 62.464L597.333333 898.275556q-39.594667 22.869333-85.333333 22.869333t-85.333333-22.869333l-206.506667-119.239112q-39.537778-22.869333-62.407111-62.464-22.869333-39.594667-22.869333-85.333333v-238.364444q0-45.738667 22.869333-85.333334T220.16 245.020444L426.666667 125.724444Q466.261333 102.968889 512 102.968889t85.333333 22.869333l206.506667 119.239111z m-56.888889 98.531556L540.444444 224.312889q-28.444444-16.384-56.888888 0L277.048889 343.608889q-28.444444 16.384-28.444445 49.265778v238.364444q0 32.881778 28.444445 49.265778l206.506667 119.239111q28.444444 16.384 56.888888 0l206.506667-119.239111q28.444444-16.384 28.444445-49.265778v-238.364444q0-32.881778-28.444445-49.265778z m-236.657778 282.737778a113.777778 113.777778 0 1 0 0-227.555556 113.777778 113.777778 0 0 0 0 227.555556z"
            fill="currentColor"
          ></path>
        </svg>
      </button>
    </div>
  </Transition>
</template>

<style scoped lang="scss">
@use '../../assets/scss/components/sidebar-btn';
@import '../../assets/scss/_modern-theme.scss';

.sidebar-container {
  margin: 1px;
  flex-direction: column;
  border-radius: var(--radius-lg);
  background: rgba(26, 31, 46, 0.4); // 降低不透明度到40%
  border: 1px solid var(--glass-border);
  transition: var(--transition-normal);
  box-shadow: var(--shadow-primary);
  // 移除backdrop-filter和isolation，避免影响tooltip

  &:hover {
    background: rgba(26, 31, 46, 0.6); // hover时稍微增加不透明度
    border-color: var(--border-primary);
    box-shadow: var(--shadow-primary), var(--shadow-glow);
  }
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all var(--transition-normal);
}

// 浅色主题下的透明样式
:root[data-theme='light'] .sidebar-container {
  background: rgba(255, 255, 255, 0.4); // 浅色主题下也降低不透明度

  &:hover {
    background: rgba(255, 255, 255, 0.6);
  }
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}
</style>
