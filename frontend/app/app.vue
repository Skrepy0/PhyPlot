<script setup lang="ts">
import {ref} from 'vue'
interface Data {
  data:number
}
let buttonData=ref<number>(0)
const inputData = 114514
const getData = async () => {
  const response = await $fetch<Data>('/api/process', {
    method: 'POST',
    body: { data: inputData }
  })
  if (response.data) {
    buttonData.value = response.data
    console.log(response.data)
  }
}
</script>
<template>
  <div>
  <button @click="getData">
    {{buttonData}}
  </button>
  </div>
</template>

