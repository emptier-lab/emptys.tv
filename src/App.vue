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
  },
  mounted() {
    console.log('App mounted - AdBlocker disabled to prevent redirect loops')
  }
}
</script>

<style>
:root {
  --bg-primary: #000000;
  --bg-secondary: #111111;
  --text-primary: #ffffff;
  --text-secondary: #888888;
  --accent: #E50914; /* Netflix red, or maybe a bespoke teal: #00E5FF */
  /* Let's go with a bespoke minimal teal: #00E5FF */
  --accent-color: #00E5FF;
  
  --border-color: #222222;
  --border-radius-sm: 4px;
  --border-radius-md: 8px;
  --border-radius-lg: 12px;
  --border-radius-xl: 16px;
  
  --transition-fast: 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  --transition-normal: 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

/* COMPREHENSIVE AD BLOCKER CSS */
/* Block common ad selectors */
[class*="ad-"]:not([class*="add"]):not([class*="radio"]):not([class*="head"]):not([class*="read"]):not([class*="thread"]),
[class*="ads-"],
[class*="advertisement"],
[class*="banner"]:not([class*="page-banner"]):not([class*="hero-banner"]),
[class*="popup"]:not([class*="tooltip"]),
[class*="modal"]:not([class*="video-modal"]):not([class*="search-modal"]),
[id*="ad-"]:not([id*="add"]):not([id*="radio"]):not([id*="head"]):not([id*="read"]):not([id*="thread"]),
[id*="ads-"],
[id*="advertisement"],
[id*="banner"]:not([id*="page-banner"]):not([id*="hero-banner"]),
[id*="popup"]:not([id*="tooltip"]),
[id*="modal"]:not([id*="video-modal"]):not([id*="search-modal"]),
.ad:not(.add):not(.radio):not(.head):not(.read):not(.thread),
.ads,
.advertisement,
.banner:not(.page-banner):not(.hero-banner),
.popup:not(.tooltip),
.modal:not(.video-modal):not(.search-modal) {
  display: none !important;
  visibility: hidden !important;
  opacity: 0 !important;
  width: 0 !important;
  height: 0 !important;
  margin: 0 !important;
  padding: 0 !important;
  position: absolute !important;
  left: -9999px !important;
  top: -9999px !important;
  z-index: -1 !important;
  pointer-events: none !important;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  background: var(--bg-primary);
  color: var(--text-primary);
  overflow-x: hidden;
  scroll-behavior: smooth;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}



::-webkit-scrollbar {
  width: 4px;
}

::-webkit-scrollbar-track {
  background: var(--bg-primary);
}

::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--text-secondary);
}

.text-primary { color: var(--text-primary) !important; }
.text-secondary { color: var(--text-secondary) !important; }
.text-accent { color: var(--accent-color) !important; }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.fade-in {
  animation: fadeIn 0.4s ease-out;
}



/* Minimalist Button Styles */
.btn-primary {
  background: var(--text-primary) !important;
  color: var(--bg-primary) !important;
  border: none !important;
  border-radius: var(--border-radius-sm) !important;
  font-weight: 500 !important;
  padding: 0.75rem 1.5rem !important;
  text-transform: none !important;
  transition: opacity var(--transition-fast) !important;
  cursor: pointer;
}

.btn-primary:hover {
  opacity: 0.8 !important;
}

.btn-secondary {
  background: var(--bg-secondary) !important;
  color: var(--text-primary) !important;
  border: 1px solid var(--border-color) !important;
  border-radius: var(--border-radius-sm) !important;
  font-weight: 500 !important;
  padding: 0.75rem 1.5rem !important;
  text-transform: none !important;
  transition: border-color var(--transition-fast) !important;
  cursor: pointer;
}

.btn-secondary:hover {
  border-color: var(--text-primary) !important;
}

/* Base structural utility classes for rewrite */
.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 5vw;
}

.page-layout {
  min-height: 100vh;
  padding-top: 120px;
}

.page-title {
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 700;
  letter-spacing: -0.04em;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  color: var(--text-secondary);
  font-size: 1.1rem;
  margin-bottom: 2rem;
}

.media-grid {
  display: grid;
  gap: 2rem 1rem;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  width: 100%;
}

@media (max-width: 768px) {
  .media-grid {
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 1.5rem 0.75rem;
  }
}
</style>
