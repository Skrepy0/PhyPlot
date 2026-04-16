<template>
  <footer class="footer">
    <div class="footer-content">
      <div class="copyright">
        © {{ currentYear }} Skrepy. <a class="license" href="https://mit-license.org/" target="_blank">MIT</a>.
        <br />
        由 Skrepy 使用
        <a target="_blank" class="vue-link" href="https://github.com/vuejs/core">Vue.js</a>
        和
        <a target="_blank" class="nuxt-link" href="https://github.com/nuxt/nuxt">Nuxt</a>
        编写✏️<br />
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const currentYear = new Date().getFullYear()
</script>

<style scoped lang="scss">
@import '../../assets/scss/_modern-theme.scss';

.footer {
  padding: 20px 0;
  margin: 2rem auto 0;
  position: relative;
  border-radius: var(--radius-lg);
  background: var(--glass-bg);
  backdrop-filter: blur(var(--blur-strength));
  border: 1px solid var(--glass-border);
  color: var(--text-secondary);
  text-align: center;
  transition: var(--transition-normal);
  width: 100%;
  box-shadow: var(--shadow-primary);

  &:hover {
    border-color: var(--border-primary);
    box-shadow: var(--shadow-primary), var(--shadow-glow);
  }
}

.footer.dark-mode {
  background: var(--glass-bg);
}

.footer-content {
  text-align: center;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 0;
}

.copyright {
  font-size: 0.9rem;
  opacity: 0.9;
  text-align: center;
  line-height: 1.6;
  color: var(--text-secondary);
}

.license {
  color: var(--primary-green);
  text-decoration: none;
  transition: var(--transition-fast);

  &:hover {
    color: var(--primary-green-light);
    text-decoration: underline;
  }
}

.vue-link {
  color: #419972;
  text-decoration: none;
  transition: var(--transition-fast);

  &:hover {
    color: var(--primary-green);
    text-decoration: underline;
  }
}

.nuxt-link {
  color: #00dc82;
  text-decoration: none;
  transition: var(--transition-fast);

  &:hover {
    color: var(--primary-green-light);
    text-decoration: underline;
  }
}

@media (max-width: 768px) {
  .footer {
    width: 100%;
    margin: 1rem auto 0;
    padding: 16px 0;
  }

  .copyright {
    font-size: 0.8rem;
  }
}
</style>
