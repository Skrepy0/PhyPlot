<script setup lang="ts">
const props = defineProps<{
  show?: boolean
}>()
</script>

<template>
  <Transition name="fade-slide" mode="out-in">
    <div class="home-page" v-if="props.show">
      <div class="container">
        <div class="welcome-section">
          <div class="hero-content">
            <h1 class="main-title">欢迎使用 PhyPlot</h1>
            <p class="subtitle">易于使用的物理实验数据处理与分析工具</p>

            <div class="features-grid">
              <div class="feature-card">
                <div class="feature-icon">
                  <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="32" height="32">
                    <path
                      d="M661.333333 128a128 128 0 0 1 82.773334 225.621333l56.832 117.482667a117.333333 117.333333 0 1 1-57.578667 27.882667l-56.832-117.461334a128.618667 128.618667 0 0 1-43.52 1.173334l-133.546667 266.368a128 128 0 1 1-182.186666 16.938666l-103.445334-137.514666a106.666667 106.666667 0 1 1 52.48-36.48l102.293334 135.978666a128.597333 128.597333 0 0 1 73.578666-6.784l131.861334-263.168A128 128 0 0 1 661.333333 128zM426.666667 688.490667a58.176 58.176 0 1 0 0 116.352 58.176 58.176 0 0 0 0-116.352zM821.333333 533.333333a53.333333 53.333333 0 1 0 0 106.666667 53.333333 53.333333 0 0 0 0-106.666667zM192 378.176a48.490667 48.490667 0 1 0 0 96.981333 48.490667 48.490667 0 0 0 0-96.981333z m469.333333-180.352a58.176 58.176 0 1 0 0 116.352 58.176 58.176 0 0 0 0-116.352z"
                      fill="#fff"
                    ></path>
                  </svg>
                </div>
                <h3 class="feature-title">统计分析</h3>
                <p class="feature-desc">单变量统计分析，快速了解数据分布特征</p>
              </div>

              <div class="feature-card">
                <div class="feature-icon">
                  <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="32" height="32">
                    <path
                      d="M304.128 592.384v158.208a25.6 25.6 0 1 0 51.2 0v-158.208a25.6 25.6 0 1 0-51.2 0zM266.752 439.296L476.16 293.376l124.416 135.68a27.136 27.136 0 0 0 6.656 5.12h18.944a27.136 27.136 0 0 0 7.68-3.584l219.648-153.6a27.648 27.648 0 0 0-31.744-45.568l-204.8 141.824-115.712-134.656a27.648 27.648 0 0 0-35.84-3.584 26.624 26.624 0 0 0-7.168 3.072l-223.232 153.6a27.648 27.648 0 0 0 31.744 45.568zM457.216 484.864v265.728a25.6 25.6 0 1 0 51.2 0V484.864a25.6 25.6 0 1 0-51.2 0zM761.344 484.864v265.728a25.6 25.6 0 1 0 51.2 0V484.864a25.6 25.6 0 1 0-51.2 0zM609.792 592.384v158.208a25.6 25.6 0 1 0 51.2 0v-158.208a25.6 25.6 0 1 0-51.2 0z"
                      fill="#fff"
                    ></path>
                    <path
                      d="M897.536 851.456H288.768a102.4 102.4 0 0 1-102.4-102.4V179.2a25.6 25.6 0 0 0-51.2 0v569.856a153.6 153.6 0 0 0 153.6 153.6h608.768a25.6 25.6 0 1 0 0-51.2z"
                      fill="#fff"
                    ></path>
                  </svg>
                </div>
                <h3 class="feature-title">数据可视化</h3>
                <p class="feature-desc">拟合数据点，直观展示数据关系</p>
              </div>

              <div class="feature-card">
                <div class="feature-icon">
                  <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="32" height="32">
                    <path
                      d="M109.808941 892.867765l783.058824-783.058824 21.323294 21.323294-783.058824 783.058824-21.323294-21.293177z"
                      fill="#ffffff"
                      p-id="3692"
                    ></path>
                    <path
                      d="M150.588235 918.588235a45.176471 45.176471 0 1 1-90.352941 0 45.176471 45.176471 0 0 1 90.352941 0zM963.764706 105.411765a45.176471 45.176471 0 1 1-90.352941 0 45.176471 45.176471 0 0 1 90.352941 0zM692.705882 376.470588a45.176471 45.176471 0 1 1-90.352941 0 45.176471 45.176471 0 0 1 90.352941 0zM150.588235 587.294118a45.176471 45.176471 0 1 1-90.352941 0 45.176471 45.176471 0 0 1 90.352941 0zM481.882353 918.588235a45.176471 45.176471 0 1 1-90.352941 0 45.176471 45.176471 0 0 1 90.352941 0zM632.470588 105.411765a45.176471 45.176471 0 1 1-90.352941 0 45.176471 45.176471 0 0 1 90.352941 0zM963.764706 436.705882a45.176471 45.176471 0 1 1-90.352941 0 45.176471 45.176471 0 0 1 90.352941 0zM421.647059 647.529412a45.176471 45.176471 0 1 1-90.352941 0 45.176471 45.176471 0 0 1 90.352941 0z"
                      fill="#fff"
                    ></path>
                  </svg>
                </div>
                <h3 class="feature-title">拟合分析</h3>
                <p class="feature-desc">线性、指数、逻辑等多种拟合方法</p>
              </div>
            </div>

            <div class="quick-start">
              <h2 class="section-title">快速开始</h2>
              <div class="steps">
                <div class="step">
                  <div class="step-number">1</div>
                  <div class="step-content">
                    <h4>选择功能</h4>
                    <p>点击左侧菜单选择统计分析或图表绘制</p>
                  </div>
                </div>
                <div class="step">
                  <div class="step-number">2</div>
                  <div class="step-content">
                    <h4>导入数据</h4>
                    <p>支持手动输入或文件导入数据</p>
                  </div>
                </div>
                <div class="step">
                  <div class="step-number">3</div>
                  <div class="step-content">
                    <h4>分析可视化</h4>
                    <p>自动生成统计结果和图表</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped lang="scss">
@import '../../assets/scss/_modern-theme.scss';

.home-page {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  background: var(--bg-primary);
  border-radius: 8px;
  min-height: calc(100vh - 70px);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-section {
  margin-bottom: 3rem;
}

.hero-content {
  text-align: center;
  margin-bottom: 4rem;
}

.main-title {
  font-size: 3rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--primary-green), var(--accent-blue));
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  margin-bottom: 1rem;
  letter-spacing: -1px;
  line-height: 1.2;
}

.subtitle {
  font-size: 1.25rem;
  color: var(--text-secondary);
  margin-bottom: 3rem;
  font-weight: 400;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-bottom: 4rem;
}

.feature-card {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: 2rem;
  text-align: center;
  transition: var(--transition-normal);
  backdrop-filter: blur(var(--blur-strength));
  box-shadow: var(--shadow-primary);

  &:hover {
    transform: translateY(-4px);
    border-color: var(--border-primary);
    box-shadow: var(--shadow-primary), var(--shadow-glow);
  }
}

.feature-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 1.5rem;
  color: var(--primary-green);
  background: var(--primary-green-light);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--glass-border);
}

.feature-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
}

.feature-desc {
  color: var(--text-secondary);
  line-height: 1.5;
  font-size: 0.95rem;
}

.quick-start {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: 2.5rem;
  backdrop-filter: blur(var(--blur-strength));
}

.section-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2rem;
  text-align: center;
}

.steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.step {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.step-number {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--primary-green), var(--accent-blue));
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.step-content h4 {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.step-content p {
  color: var(--text-secondary);
  line-height: 1.5;
  font-size: 0.95rem;
}

.fade-slide-enter-active {
  transition: all 0.3s ease-out;
}

.fade-slide-leave-active {
  transition: all 0.4s ease-in;
  overflow: hidden;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-30px);
  visibility: hidden;
}

// 动画期间的容器处理
.fade-slide-leave-active .container {
  overflow: hidden;
}

@media (max-width: 768px) {
  .home-page {
    padding: 1rem;
  }

  .main-title {
    font-size: 2rem;
  }

  .subtitle {
    font-size: 1rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .steps {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}
</style>
