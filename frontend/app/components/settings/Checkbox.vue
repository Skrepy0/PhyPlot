<template>
  <label class="checkbox">
    <input type="checkbox" :checked="modelValue" @change="updateValue" />
    <span class="checkmark"></span>
    <span v-if="$slots.default" class="checkbox-label">
      <slot></slot>
    </span>
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

.checkbox {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;

  input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }

  .checkmark {
    width: 20px;
    height: 20px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(46, 204, 113, 0.4);
    border-radius: 4px;
    transition: all 0.2s;
    position: relative;
    backdrop-filter: blur(4px);

    &::after {
      content: '';
      position: absolute;
      display: none;
      left: 6px;
      top: 2px;
      width: 5px;
      height: 10px;
      border: solid white;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }
  }

  input:checked + .checkmark {
    background: $accent-green;
    border-color: $accent-green;

    &::after {
      display: block;
    }
  }

  &:hover .checkmark {
    background: rgba(46, 204, 113, 0.2);
  }

  .checkbox-label {
    font-size: 0.9rem;
    color: $text-primary;
  }
}
</style>
