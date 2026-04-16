<script setup lang="ts"></script>

<template>
  <div class="bg"></div>
</template>

<style scoped lang="scss">
@import '../../assets/scss/_modern-theme.scss';

.bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 50%, var(--bg-tertiary) 100%);
  z-index: -1;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background:
      radial-gradient(circle at 20% 80%, rgba(46, 204, 113, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(52, 152, 219, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(46, 204, 113, 0.05) 0%, transparent 50%);
    pointer-events: none;
  }
}
</style>
