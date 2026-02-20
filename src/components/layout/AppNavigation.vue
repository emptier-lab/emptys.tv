<template>
  <header class="minimal-nav">
    <div class="nav-container container">
      <router-link to="/" class="brand-link" aria-label="Home">
        <span class="brand-text">empty.tv</span>
      </router-link>

      <nav class="nav-links d-none d-md-flex">
        <router-link
          v-for="link in navLinks"
          :key="link.name"
          :to="link.to"
          class="nav-item"
        >
          {{ link.text }}
        </router-link>
      </nav>

      <div class="actions">
        <button class="icon-btn search-btn" @click="openSearch" aria-label="Search">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="search-icon">
            <path stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </button>

        <button class="icon-btn menu-btn d-md-none" @click="toggleMenu" aria-label="Menu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>
      </div>
    </div>
    
    <!-- Mobile Menu Overlay -->
    <div class="mobile-menu-overlay" :class="{ 'is-active': isMenuOpen }">
      <button class="close-menu-btn" @click="toggleMenu">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
      <div class="mobile-nav-links">
        <router-link
          v-for="link in navLinks"
          :key="link.name"
          :to="link.to"
          class="mobile-nav-item"
          @click="toggleMenu"
        >
          {{ link.text }}
        </router-link>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: 'AppNavigation',
  data() {
    return {
      isMenuOpen: false,
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
  methods: {
    openSearch() {
      this.$router.push('/search');
      this.isMenuOpen = false;
    },
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen;
      if (this.isMenuOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }
  }
}
</script>

<style scoped>
.minimal-nav {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-color);
  height: 70px;
  display: flex;
  align-items: center;
}

.nav-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.brand-link {
  text-decoration: none;
  color: var(--text-primary);
  display: flex;
  align-items: center;
}

.brand-text {
  font-weight: 800;
  font-size: 1.25rem;
  letter-spacing: -0.05em;
  font-family: inherit;
}

.nav-links {
  display: none;
  gap: 2rem;
  align-items: center;
}

@media (min-width: 768px) {
  .nav-links {
    display: flex;
  }
}

.nav-item {
  text-decoration: none;
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 0.9rem;
  transition: color var(--transition-fast);
  position: relative;
}

.nav-item:hover, .nav-item.router-link-active {
  color: var(--text-primary);
}

.actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.icon-btn {
  background: transparent;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  transition: opacity var(--transition-fast);
}

.icon-btn:hover {
  opacity: 0.7;
}

.menu-btn {
  display: flex;
}

@media (min-width: 768px) {
  .menu-btn {
    display: none;
  }
}

.mobile-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: var(--bg-primary);
  z-index: 2000;
  display: flex;
  flex-direction: column;
  padding: 2rem;
  transform: translateY(-100%);
  transition: transform var(--transition-normal);
}

.mobile-menu-overlay.is-active {
  transform: translateY(0);
}

.close-menu-btn {
  align-self: flex-end;
  background: transparent;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
  padding: 1rem;
}

.mobile-nav-links {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-top: 4rem;
}

.mobile-nav-item {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-secondary);
  text-decoration: none;
  transition: color var(--transition-fast);
  letter-spacing: -0.04em;
}

.mobile-nav-item:hover, .mobile-nav-item.router-link-active {
  color: var(--text-primary);
}
</style>

