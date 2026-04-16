<script setup lang="ts">
import { useTheme } from '~/composables/theme'

const { currentTheme, effectiveTheme, toggleTheme, getThemeIcon, getThemeName, isDark, isLight, isAuto } = useTheme()
</script>

<template>
  <div class="theme-switcher" title="切换主题 (当前: {{ getThemeName(effectiveTheme) }})">
    <button class="theme-btn" @click="toggleTheme" :aria-label="`切换到${getThemeName(effectiveTheme === 'light' ? 'dark' : effectiveTheme === 'dark' ? 'auto' : 'light')}主题`">
      <span class="theme-icon">{{ getThemeIcon(currentTheme) }}</span>
      <span class="theme-name">{{ getThemeName(effectiveTheme) }}</span>
      <span class="theme-arrow">↻</span>
    </button>
  </div>
</template>

<style scoped lang="scss">
.theme-switcher {
  position: relative;
}

.theme-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--glass-bg);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  backdrop-filter: blur(var(--blur-strength));

  &:hover {
    background: var(--primary-green-light);
    border-color: var(--primary-green);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(46, 204, 113, 0.2);
  }

  &:active {
    transform: translateY(0);
  }
}

.theme-icon {
  font-size: 16px;
  transition: transform var(--transition-normal);

  .theme-btn:hover & {
    transform: rotate(360deg);
  }
}

.theme-name {
  @media (max-width: 480px) {
    display: none;
  }
}

.theme-arrow {
  font-size: 12px;
  opacity: 0.7;
  transition: transform var(--transition-fast);

  .theme-btn:hover & {
    transform: rotate(180deg);
    opacity: 1;
  }
}

// 主题切换动画
.theme-switcher {
  .theme-btn {
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: var(--transition-normal);
    }

    &:hover::before {
      left: 100%;
    }
  }
}

// 响应式调整
@media (max-width: 768px) {
  .theme-btn {
    padding: 6px 12px;
    font-size: 12px;

    .theme-icon {
      font-size: 14px;
    }
  }
}
</style>