<script setup lang="ts">
import { ref } from 'vue'
const showSidebar = ref(false)
const showUnivariateStatistics = ref(false)

const hideSidebar = () => {
  showSidebar.value = false
}
defineExpose({
  showUnivariateStatistics,
})
</script>

<template>
  <WeltButton @show-sidebar="showSidebar = !showSidebar" v-if="!showSidebar" />
  <Transition name="slide-fade">
    <div class="sidebar-container" v-if="showSidebar">
      <button
        class="data-point-btn sidebar-btn"
        tooltip="单变量统计"
        data-position="right"
        @click="
          showUnivariateStatistics = true
          hideSidebar()
        "
      >
        <svg
          class="icon"
          viewBox="0 0 1024 1024"
          xmlns="http://www.w3.org/2000/svg"
          width="25"
          height="25"
        >
          <path
            d="M661.333333 128a128 128 0 0 1 82.773334 225.621333l56.832 117.482667a117.333333 117.333333 0 1 1-57.578667 27.882667l-56.832-117.461334a128.618667 128.618667 0 0 1-43.52 1.173334l-133.546667 266.368a128 128 0 1 1-182.186666 16.938666l-103.445334-137.514666a106.666667 106.666667 0 1 1 52.48-36.48l102.293334 135.978666a128.597333 128.597333 0 0 1 73.578666-6.784l131.861334-263.168A128 128 0 0 1 661.333333 128zM426.666667 688.490667a58.176 58.176 0 1 0 0 116.352 58.176 58.176 0 0 0 0-116.352zM821.333333 533.333333a53.333333 53.333333 0 1 0 0 106.666667 53.333333 53.333333 0 0 0 0-106.666667zM192 378.176a48.490667 48.490667 0 1 0 0 96.981333 48.490667 48.490667 0 0 0 0-96.981333z m469.333333-180.352a58.176 58.176 0 1 0 0 116.352 58.176 58.176 0 0 0 0-116.352z"
            fill="#fff"
          ></path>
        </svg>
      </button>
      <button
        class="statistic-btn sidebar-btn"
        tooltip="统计"
        data-position="right"
      >
        <svg
          class="icon"
          viewBox="0 0 1024 1024"
          xmlns="http://www.w3.org/2000/svg"
          width="25"
          height="25"
        >
          <path
            d="M908.288 692.224a25.6 25.6 0 0 1-46.592-21.248 384 384 0 1 0-114.688 144.7424 25.6 25.6 0 0 1 31.3344 40.448 435.2 435.2 0 1 1 129.8944-163.9936z m-461.824-34.816l-76.5952-136.0384-93.184 127.7952a25.6 25.6 0 1 1-41.3696-30.208l140.1344-192.1024 77.056 136.9088 113.408-151.9616 98.816 127.7952 112.2816-194.048a25.6 25.6 0 0 1 44.288 25.6512l-150.4256 260.0448-104.2432-134.8096-120.1152 160.9728z"
            fill="#ffffff"
          ></path>
        </svg>
      </button>
      <button
        class="chart-btn sidebar-btn"
        tooltip="图表"
        data-position="right"
      >
        <svg
          class="icon"
          viewBox="0 0 1024 1024"
          xmlns="http://www.w3.org/2000/svg"
          width="25"
          height="25"
        >
          <path
            d="M304.128 592.384v158.208a25.6 25.6 0 1 0 51.2 0v-158.208a25.6 25.6 0 1 0-51.2 0zM266.752 439.296L476.16 293.376l124.416 135.68a27.136 27.136 0 0 0 6.656 5.12h18.944a27.136 27.136 0 0 0 7.68-3.584l219.648-153.6a27.648 27.648 0 0 0-31.744-45.568l-204.8 141.824-115.712-134.656a27.648 27.648 0 0 0-35.84-3.584 26.624 26.624 0 0 0-7.168 3.072l-223.232 153.6a27.648 27.648 0 0 0 31.744 45.568zM457.216 484.864v265.728a25.6 25.6 0 1 0 51.2 0V484.864a25.6 25.6 0 1 0-51.2 0zM761.344 484.864v265.728a25.6 25.6 0 1 0 51.2 0V484.864a25.6 25.6 0 1 0-51.2 0zM609.792 592.384v158.208a25.6 25.6 0 1 0 51.2 0v-158.208a25.6 25.6 0 1 0-51.2 0z"
            fill="#ffffff"
          ></path>
          <path
            d="M897.536 851.456H288.768a102.4 102.4 0 0 1-102.4-102.4V179.2a25.6 25.6 0 0 0-51.2 0v569.856a153.6 153.6 0 0 0 153.6 153.6h608.768a25.6 25.6 0 1 0 0-51.2z"
            fill="#ffffff"
          ></path>
        </svg>
      </button>
      <button
        class="settings-btn sidebar-btn"
        tooltip="设置"
        data-position="right"
      >
        <svg
          class="icon"
          viewBox="0 0 1024 1024"
          xmlns="http://www.w3.org/2000/svg"
          width="25"
          height="25"
        >
          <path
            d="M803.84 245.020444q39.537778 22.869333 62.407111 62.464 22.869333 39.594667 22.869333 85.333334v238.364444q0 45.738667-22.869333 85.333334t-62.464 62.464L597.333333 898.275556q-39.594667 22.869333-85.333333 22.869333t-85.333333-22.869333l-206.506667-119.239112q-39.537778-22.869333-62.407111-62.464-22.869333-39.594667-22.869333-85.333333v-238.364444q0-45.738667 22.869333-85.333334T220.16 245.020444L426.666667 125.724444Q466.261333 102.968889 512 102.968889t85.333333 22.869333l206.506667 119.239111z m-56.888889 98.531556L540.444444 224.312889q-28.444444-16.384-56.888888 0L277.048889 343.608889q-28.444444 16.384-28.444445 49.265778v238.364444q0 32.881778 28.444445 49.265778l206.506667 119.239111q28.444444 16.384 56.888888 0l206.506667-119.239111q28.444444-16.384 28.444445-49.265778v-238.364444q0-32.881778-28.444445-49.265778z m-236.657778 282.737778a113.777778 113.777778 0 1 0 0-227.555556 113.777778 113.777778 0 0 0 0 227.555556z"
            fill="#ffffff"
          ></path>
        </svg>
      </button>
      <button
        class="close-btn sidebar-btn"
        tooltip="关闭"
        data-position="right"
        @click="hideSidebar"
      >
        <svg
          class="icon"
          viewBox="0 0 1024 1024"
          xmlns="http://www.w3.org/2000/svg"
          width="25"
          height="25"
        >
          <path
            d="M224.32 505.6a31.936 31.936 0 0 1 10.88-19.84l222.08-222.08a32 32 0 0 1 45.12 45.12l-169.28 169.28H768a32 32 0 0 1 0 64H333.12l169.28 169.28a32 32 0 1 1-45.12 45.44l-224-224a31.968 31.968 0 0 1-8.96-27.2z"
            fill="#fff"
          ></path>
        </svg>
      </button>
    </div>
  </Transition>
</template>

<style scoped lang="scss">
@use '../../assets/scss/components/tooltip';
@use '../../assets/scss/components/sidebar-btn';
.sidebar-container {
  margin: 1px;
  flex-direction: column;
  border-radius: 13px;
  background-color: rgba(27, 30, 27, 0.75);
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}
</style>
