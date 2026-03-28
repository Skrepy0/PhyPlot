<script setup lang="ts">
import { defineEmits, ref,defineProps } from 'vue'
const props = defineProps({

})

</script>

<template>
<div class="welt-btn-container">
  <button class = "welt-btn" @click="$emit('show-sidebar')">
    +
  </button>
</div>
</template>

<style scoped>

</style>