<template>
  <label class="toggle-switch" :class="{ checked: modelValue }">
    <input type="checkbox" :checked="modelValue" @change="updateValue" />
    <span class="slider"></span>
  </label>
</template>

<script setup lang="ts">
const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ (e: 'update:modelValue', value: boolean): void }>()

const updateValue = (e: Event) => {
  const target = e.target as HTMLInputElement
  emit('update:modelValue', target.checked)
}
</script>

<style scoped lang="scss">
@import '../../../assets/scss/components/colors.scss';

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 52px;
  height: 28px;
  cursor: pointer;
  flex-shrink: 0;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    cursor: pointer;
    position: absolute;
    inset: 0;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 34px;
    transition: 0.3s;
    border: 1px solid rgba(46, 204, 113, 0.3);
    backdrop-filter: blur(4px);

    &::before {
      content: '';
      position: absolute;
      height: 22px;
      width: 22px;
      left: 3px;
      bottom: 2px;
      background: #ffffff;
      border-radius: 50%;
      transition: 0.20s;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
  }

  &.checked .slider {
    background: rgba(46, 204, 113, 0.2);
    border-color: $accent-green;

    &::before {
      transform: translateX(22px);
      background: $accent-green;
    }
  }

  &:hover .slider {
    background: rgba(46, 204, 113, 0.1);
  }
}
</style>
