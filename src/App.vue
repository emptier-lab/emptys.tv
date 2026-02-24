<template>
  <div id="app" class="app-container">

    <AppNavigation />
    <main class="main-content">
      <router-view />
    </main>
    <SideNotifications />
  </div>
</template>

<script>
import AppNavigation from '@/components/layout/AppNavigation.vue'
import SideNotifications from '@/components/common/SideNotifications.vue'

export default {
  name: 'App',
  components: {
    AppNavigation,
    SideNotifications
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

:root {
  --bg-primary: #0a0a0f;
  --bg-secondary: #12121a;
  --bg-tertiary: #1a1a28;
  --bg-card: rgba(255, 255, 255, 0.03);
  --bg-glass: rgba(10, 10, 15, 0.7);

  --text-primary: #eeeef0;
  --text-secondary: #7a7a8e;
  --text-muted: #4a4a5a;

  --accent: #818CF8;
  --accent-soft: rgba(129, 140, 248, 0.15);
  --accent-glow: rgba(129, 140, 248, 0.3);
  --accent-color: #818CF8;

  --green: #34D399;
  --amber: #FBBF24;
  --rose: #FB7185;

  --border-color: rgba(255, 255, 255, 0.06);
  --border-hover: rgba(255, 255, 255, 0.12);

  --border-radius-sm: 6px;
  --border-radius-md: 10px;
  --border-radius-lg: 14px;
  --border-radius-xl: 20px;
  --border-radius-full: 9999px;

  --transition-fast: 0.15s ease;
  --transition-normal: 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  --transition-slow: 0.5s cubic-bezier(0.16, 1, 0.3, 1);

  --nav-height: 64px;
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  font-family: var(--font-sans);
  background: var(--bg-primary);
  color: var(--text-primary);
  overflow-x: hidden;
  scroll-behavior: smooth;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-feature-settings: 'cv11', 'ss01';
}

a {
  color: inherit;
  text-decoration: none;
}

img {
  display: block;
  max-width: 100%;
}

button {
  font-family: inherit;
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.15);
}

.text-primary { color: var(--text-primary) !important; }
.text-secondary { color: var(--text-secondary) !important; }
.text-accent { color: var(--accent) !important; }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.fade-in {
  animation: fadeIn 0.4s ease-out;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--text-primary);
  color: var(--bg-primary);
  border: none;
  border-radius: var(--border-radius-full);
  font-weight: 600;
  font-size: 0.9rem;
  padding: 12px 28px;
  cursor: pointer;
  transition: transform var(--transition-fast), opacity var(--transition-fast);
}

.btn-primary:hover {
  transform: scale(1.03);
  opacity: 0.9;
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-full);
  font-weight: 500;
  font-size: 0.9rem;
  padding: 12px 28px;
  cursor: pointer;
  backdrop-filter: blur(12px);
  transition: background var(--transition-fast), border-color var(--transition-fast);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: var(--border-hover);
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 clamp(1rem, 4vw, 3rem);
}



.page-layout {
  min-height: 100vh;
  padding-top: calc(var(--nav-height) + 32px);
}

.page-title {
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.1;
}

.page-subtitle {
  color: var(--text-secondary);
  font-size: 1rem;
  margin-top: 6px;
}

.media-grid {
  display: grid;
  gap: 24px 16px;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  width: 100%;
}

@media (max-width: 768px) {
  .media-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 16px 10px;
  }
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.section-title {
  font-size: 1.3rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.section-link {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--accent);
  transition: opacity var(--transition-fast);
}

.section-link:hover {
  opacity: 0.7;
}

.scroll-row {
  display: flex;
  gap: 14px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 8px;
  scrollbar-width: none;
}

.scroll-row::-webkit-scrollbar {
  display: none;
}

.scroll-row > * {
  scroll-snap-align: start;
  flex-shrink: 0;
}
</style>
