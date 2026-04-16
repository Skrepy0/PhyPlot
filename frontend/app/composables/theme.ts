import { ref, computed, onMounted } from 'vue'

type Theme = 'light' | 'dark' | 'auto'

export function useTheme() {
  const currentTheme = ref<Theme>('auto')

  // 检测系统主题偏好
  const getSystemTheme = (): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  // 获取实际生效的主题
  const effectiveTheme = computed<'light' | 'dark'>(() => {
    if (currentTheme.value === 'auto') {
      return getSystemTheme()
    }
    return currentTheme.value
  })

  // 应用主题到 document
  const applyTheme = (theme: 'light' | 'dark') => {
    if (typeof document === 'undefined') return

    document.documentElement.setAttribute('data-theme', theme)

    // 保存到 localStorage
    localStorage.setItem('theme', currentTheme.value)
  }

  // 切换主题
  const toggleTheme = () => {
    const themes: Theme[] = ['light', 'dark', 'auto']
    const currentIndex = themes.indexOf(currentTheme.value)
    const nextIndex = (currentIndex + 1) % themes.length
    currentTheme.value = themes[nextIndex]
    applyTheme(effectiveTheme.value)
  }

  // 设置特定主题
  const setTheme = (theme: Theme) => {
    currentTheme.value = theme
    applyTheme(effectiveTheme.value)
  }

  // 获取主题图标
  const getThemeIcon = (theme: Theme): string => {
    switch (theme) {
      case 'light': return '☀️'
      case 'dark': return '🌙'
      case 'auto': return '💻'
      default: return '💻'
    }
  }

  // 获取主题名称
  const getThemeName = (theme: Theme): string => {
    switch (theme) {
      case 'light': return '明亮'
      case 'dark': return '黑暗'
      case 'auto': return '跟随系统'
      default: return '跟随系统'
    }
  }

  // 初始化主题
  onMounted(() => {
    // 从 localStorage 读取保存的主题设置
    const savedTheme = localStorage.getItem('theme') as Theme
    if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
      currentTheme.value = savedTheme
    }

    // 应用主题
    applyTheme(effectiveTheme.value)

    // 监听系统主题变化
    if (typeof window !== 'undefined') {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (currentTheme.value === 'auto') {
          applyTheme(effectiveTheme.value)
        }
      })
    }
  })

  return {
    currentTheme,
    effectiveTheme,
    toggleTheme,
    setTheme,
    getThemeIcon,
    getThemeName,
    isDark: computed(() => effectiveTheme.value === 'dark'),
    isLight: computed(() => effectiveTheme.value === 'light'),
    isAuto: computed(() => currentTheme.value === 'auto')
  }
}