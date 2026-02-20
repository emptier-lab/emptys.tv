<template>
  <header class="nav-bar" :class="{ scrolled: isScrolled, hidden: isHidden }">
    <div class="nav-inner">
      <router-link to="/" class="nav-brand" aria-label="Home">
        <span class="brand-name">empty</span>
      </router-link>

      <nav class="nav-center">
        <router-link
          v-for="link in navLinks"
          :key="link.name"
          :to="link.to"
          class="nav-link"
          :class="{ active: $route.path === link.to }"
        >
          {{ link.text }}
        </router-link>
      </nav>

      <div class="nav-actions">
        <button class="nav-icon-btn" @click="openSearch" aria-label="Search">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </button>

        <button class="nav-icon-btn mobile-menu-toggle" @click="toggleMenu" aria-label="Menu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <line x1="4" y1="6" x2="20" y2="6"/>
            <line x1="4" y1="12" x2="20" y2="12"/>
            <line x1="4" y1="18" x2="20" y2="18"/>
          </svg>
        </button>
      </div>
    </div>

    <transition name="mobile-slide">
      <div v-if="isMenuOpen" class="mobile-drawer">
        <div class="drawer-header">
          <span class="drawer-title">Menu</span>
          <button class="nav-icon-btn" @click="toggleMenu" aria-label="Close">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <nav class="drawer-links">
          <router-link
            v-for="link in navLinks"
            :key="link.name"
            :to="link.to"
            class="drawer-link"
            @click="toggleMenu"
          >
            {{ link.text }}
          </router-link>
        </nav>
      </div>
    </transition>

    <transition name="fade">
      <div v-if="isMenuOpen" class="drawer-backdrop" @click="toggleMenu"></div>
    </transition>
  </header>
</template>

<script>
export default {
  name: 'AppNavigation',
  data() {
    return {
      isMenuOpen: false,
      isScrolled: false,
      isHidden: false,
      lastScrollY: 0,
      navLinks: [
        { name: 'home', text: 'Home', to: '/' },
        { name: 'movies', text: 'Movies', to: '/movies' },
        { name: 'tv', text: 'TV Shows', to: '/tv-shows' },
        { name: 'trending', text: 'Trending', to: '/trending' },
        { name: 'favorites', text: 'Favorites', to: '/favorites' },
        { name: 'watchlist', text: 'Watchlist', to: '/watchlist' }
      ]
    }
  },
  mounted() {
    window.addEventListener('scroll', this.handleScroll, { passive: true })
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.handleScroll)
  },
  methods: {
    openSearch() {
      this.$router.push('/search')
      this.isMenuOpen = false
    },
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen
      document.body.style.overflow = this.isMenuOpen ? 'hidden' : ''
    },
    handleScroll() {
      const y = window.scrollY
      this.isScrolled = y > 20
      this.isHidden = y > 400 && y > this.lastScrollY
      this.lastScrollY = y
    }
  }
}
</script>

<style scoped>
.nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  height: var(--nav-height);
  display: flex;
  align-items: center;
  padding: 0 clamp(1rem, 4vw, 3rem);
  transition: background 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
}

.nav-bar.scrolled {
  background: var(--bg-glass);
  backdrop-filter: blur(20px) saturate(1.4);
  -webkit-backdrop-filter: blur(20px) saturate(1.4);
  box-shadow: 0 1px 0 var(--border-color);
}

.nav-bar.hidden {
  transform: translateY(-100%);
}

.nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: var(--text-primary);
  flex-shrink: 0;
}

.brand-name {
  font-weight: 800;
  font-size: 1.15rem;
  letter-spacing: -0.04em;
}

.nav-center {
  display: none;
  gap: 6px;
  align-items: center;
}

@media (min-width: 860px) {
  .nav-center {
    display: flex;
  }
}

.nav-link {
  text-decoration: none;
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 0.85rem;
  padding: 6px 14px;
  border-radius: var(--border-radius-full);
  transition: color var(--transition-fast), background var(--transition-fast);
}

.nav-link:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.05);
}

.nav-link.active,
.nav-link.router-link-active {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.08);
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.nav-icon-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--border-radius-full);
  transition: color var(--transition-fast), background var(--transition-fast);
}

.nav-icon-btn:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.06);
}

.mobile-menu-toggle {
  display: flex;
}

@media (min-width: 860px) {
  .mobile-menu-toggle {
    display: none;
  }
}

.drawer-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 1998;
}

.mobile-drawer {
  position: fixed;
  top: 0;
  right: 0;
  width: min(320px, 85vw);
  height: 100vh;
  background: var(--bg-secondary);
  border-left: 1px solid var(--border-color);
  z-index: 1999;
  display: flex;
  flex-direction: column;
  padding: 24px;
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
}

.drawer-title {
  font-weight: 700;
  font-size: 1.1rem;
}

.drawer-links {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.drawer-link {
  font-size: 1.05rem;
  font-weight: 500;
  color: var(--text-secondary);
  text-decoration: none;
  padding: 12px 16px;
  border-radius: var(--border-radius-md);
  transition: color var(--transition-fast), background var(--transition-fast);
}

.drawer-link:hover,
.drawer-link.router-link-active {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.05);
}

.mobile-slide-enter-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.mobile-slide-leave-active {
  transition: transform 0.25s ease-in;
}
.mobile-slide-enter-from,
.mobile-slide-leave-to {
  transform: translateX(100%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
