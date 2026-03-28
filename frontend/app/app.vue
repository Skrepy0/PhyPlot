<script setup lang="ts">
import { ref } from 'vue'
import SideBar from '~/components/SideBar.vue'
import Head from '~/components/Head.vue'
import Foot from '~/components/Foot.vue'
import Toast from '~/components/Toast.vue'

interface Data {
  data: number
}

let buttonData = ref<number>(0)
const inputData = 114514
const getData = async () => {
  const response = await $fetch<Data>('/api/process', {
    method: 'POST',
    body: { data: inputData },
  })
  if (response.data) {
    buttonData.value = response.data
    console.log(response.data)
  }
}

const toastRef = ref<InstanceType<typeof Toast> | null>(null)

const toastAdd = (message: string, options?: any) => {
  if (toastRef.value?.add) {
    toastRef.value.add(message, options)
  } else {
    console.warn('Toast 组件尚未挂载')
  }
}
provide('toast', toastAdd)
</script>
<template>
  <BackGround />
  <Head />
  <div class="context">
    <SideBar />
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
