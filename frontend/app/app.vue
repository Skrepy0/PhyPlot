<script setup lang="ts">
import { ref } from 'vue'
import SideBar from '~/components/SideBar.vue'
import Head from '~/components/Head.vue'
import Foot from '~/components/Foot.vue'
import Toast from '~/components/data-components/Toast.vue'
import UnivariateStatistics from '~/components/univariate-statistics/UnivariateStatistics.vue'
import Dialog from '~/components/data-components/Dialog.vue'
import DrawChartPage from '~/components/chart/DrawChartPage.vue'
const dialogRef = ref()
const toastRef = ref<InstanceType<typeof Toast> | null>(null)
const pageStatus = ref<InstanceType<typeof SideBar> | null>(null)
const toastAdd = (message: string, options?: any) => {
  if (toastRef.value?.add) {
    toastRef.value.add(message, options)
  } else {
    console.warn('Toast 组件尚未挂载')
  }
}

const showDialog = (options: {
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
  onCancel?: () => void
}) => {
  return dialogRef.value.show(options)
}
true
provide('dialog', showDialog)
provide('toast', toastAdd)
</script>
<template>
  <BackGround />
  <Head />
  <div class="context">
    <SideBar ref="pageStatus" />
    <Settings :show="pageStatus?.showSettings"></Settings>
    <UnivariateStatistics :show="pageStatus?.showUnivariateStatistics" />
    <DrawChartPage :show="pageStatus?.showDrawChart"></DrawChartPage>
    <Dialog ref="dialogRef" />
    <Toast ref="toastRef" />
  </div>
  <Foot />
</template>

<style scoped lang="scss">
.context {
  display: flex;
  min-height: calc(100vh - 70px);
  margin-top: 70px;

  :deep(.sidebar) {
    width: 260px;
    flex-shrink: 0;
    background-color: rgba(30, 30, 35, 0.8);
    backdrop-filter: blur(10px);
    border-right: 1px solid rgba(255, 255, 255, 0.1);
  }
}
</style>
