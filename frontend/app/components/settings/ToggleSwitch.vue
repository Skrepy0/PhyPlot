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
@import '../../../assets/scss/_modern-theme.scss';

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
    background: var(--glass-bg);
    border-radius: 34px;
    transition: var(--transition-normal);
    border: 1px solid var(--border-secondary);
    backdrop-filter: blur(var(--blur-strength));

    &::before {
      content: '';
      position: absolute;
      height: 22px;
      width: 22px;
      left: 3px;
      bottom: 2px;
      background: var(--text-primary);
      border-radius: 50%;
      transition: var(--transition-normal);
      box-shadow: var(--shadow-primary);
    }
  }

  &.checked .slider {
    background: var(--primary-green-light);
    border-color: var(--primary-green);

    &::before {
      transform: translateX(22px);
      background: var(--primary-green);
    }
  }

  &:hover .slider {
    border-color: var(--border-primary);
    box-shadow: 0 0 0 3px rgba(46, 204, 113, 0.1);
  }
}
</style>
