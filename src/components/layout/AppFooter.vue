<template>
  <footer class="app-footer">
    <div class="page-container">
      <div class="footer-grid">
        <div class="footer-section">
          <div class="footer-logo">
            <svg viewBox="0 0 24 24" class="icon primary-icon"><path fill="currentColor" d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
            <span class="footer-logo-text">empty.tv</span>
          </div>
          <p class="footer-description">
            Your gateway to unlimited entertainment. Stream movies and TV shows from multiple sources.
          </p>
        </div>

        <div class="footer-section">
          <h4 class="footer-title">Browse</h4>
          <ul class="footer-links">
            <li v-for="link in browseLinks" :key="link.name">
              <router-link :to="link.to" class="footer-link">
                {{ link.text }}
              </router-link>
            </li>
          </ul>
        </div>

        <div class="footer-section">
          <h4 class="footer-title">Account</h4>
          <ul class="footer-links">
            <li v-for="link in accountLinks" :key="link.name">
              <router-link :to="link.to" class="footer-link">
                {{ link.text }}
              </router-link>
            </li>
          </ul>
        </div>

        <div class="footer-section">
          <h4 class="footer-title">Stay Connected</h4>
          <p class="footer-text">
            Follow us for the latest updates and new features.
          </p>
          <div class="social-links">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" class="social-btn">
              <svg viewBox="0 0 24 24" class="icon"><path fill="currentColor" d="M12 1.27a11 11 0 00-3.48 21.46c.55.09.73-.28.73-.55v-1.84c-3.03.64-3.67-1.46-3.67-1.46-.55-1.29-1.28-1.65-1.28-1.65-.92-.65.1-.65.1-.65 1.1 0 1.73 1.1 1.73 1.1.92 1.65 2.57 1.2 3.21.92a2 2 0 01.64-1.47c-2.47-.27-5.04-1.19-5.04-5.5 0-1.1.46-2.1 1.2-2.84-.1-.28-.55-1.38.1-2.84 0 0 .92-.28 2.84 1.1a10.6 10.6 0 015.13 0c1.92-1.38 2.84-1.1 2.84-1.1.65 1.46.2 2.56.1 2.84.74.74 1.2 1.74 1.2 2.84 0 4.31-2.57 5.23-5.04 5.5.64.55 1.1 1.65 1.1 3.3v2.2c0 .28.18.64.74.55A11 11 0 0012 1.27"/></svg>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" class="social-btn">
              <svg viewBox="0 0 24 24" class="icon"><path fill="currentColor" d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 01-1.93.07 4.28 4.28 0 004 2.98 8.52 8.52 0 01-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/></svg>
            </a>
            <a href="https://discord.com" target="_blank" rel="noopener noreferrer" class="social-btn">
              <svg viewBox="0 0 24 24" class="icon"><path fill="currentColor" d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 00-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 00-4.8 0c-.14-.34-.35-.76-.54-1.09a.09.09 0 00-.07-.03c-1.5.26-2.93.71-4.27 1.33-.01 0-.01.01-.02.02C2.05 11.28.9 16.71 1.36 22a.1.1 0 00.04.08c1.77 1.32 3.47 2.12 5.12 2.65.04.01.08-.01.1-.04.4-.55.76-1.13 1.07-1.74a.1.1 0 00-.04-.13c-.57-.22-1.11-.48-1.64-.78-.05-.03-.05-.1-.01-.13l.39-.29a.08.08 0 01.08 0c3.18 1.47 6.64 1.47 9.8 0a.08.08 0 01.09 0l.38.29c.04.03.04.1-.01.13-.53.3-1.08.56-1.65.78a.1.1 0 00-.04.13c.32.61.68 1.19 1.07 1.74.02.03.06.05.1.04 1.65-.53 3.35-1.33 5.12-2.65.03-.02.04-.05.04-.08.51-5.74-.83-10.97-3.41-16.63-.01-.01-.02-.02-.03-.02zM8.02 15.33c-1.18 0-2.15-1.08-2.15-2.41s.96-2.41 2.15-2.41c1.2 0 2.17 1.09 2.15 2.41 0 1.33-.96 2.41-2.15 2.41zm7.97 0c-1.18 0-2.15-1.08-2.15-2.41s.96-2.41 2.15-2.41c1.2 0 2.17 1.09 2.15 2.41 0 1.33-.95 2.41-2.15 2.41z"/></svg>
            </a>
          </div>
        </div>
      </div>

      <hr class="footer-divider" />

      <div class="footer-bottom">
        <div class="footer-info">
          <p class="footer-copyright">
            © {{ currentYear }} empty.tv. Made with ❤️ for movie lovers.
          </p>
          <p class="footer-disclaimer">
            This site does not host any content. All videos are provided by third-party sources.
          </p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'AppFooter',
  data() {
    return {
      browseLinks: [
        { name: 'movies', text: 'Movies', to: '/movies' },
        { name: 'tv', text: 'TV Shows', to: '/tv-shows' },
        { name: 'trending', text: 'Trending', to: '/trending' },
        { name: 'search', text: 'Search', to: '/search' }
      ],
      accountLinks: [
        { name: 'favorites', text: 'Favorites', to: '/favorites' },
        { name: 'watchlist', text: 'Watchlist', to: '/watchlist' },
        { name: 'test', text: 'Test Player', to: '/test' }
      ]
    }
  },
  computed: {
    currentYear() {
      return new Date().getFullYear()
    }
  }
}
</script>

<style scoped>
.app-footer {
  background: rgba(26, 29, 41, 0.95);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding: 3rem 0 2rem 0;
  margin-top: 4rem;
}

.footer-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 2fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.footer-section {
  display: flex;
  flex-direction: column;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.primary-icon {
  color: var(--primary-color);
  width: 28px;
  height: 28px;
}

.footer-logo-text {
  font-size: 1.25rem;
  font-weight: 700;
  color: #FFFFFF;
  background: linear-gradient(135deg, #00D4AA 0%, #6C5CE7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.footer-description {
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.6;
  max-width: 300px;
}

.footer-title {
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.footer-link {
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.9rem;
  transition: color var(--transition-fast);
}

.footer-link:hover {
  color: var(--accent-color);
}

.footer-text {
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 1rem;
}

.social-links {
  display: flex;
  gap: 1rem;
}

.social-btn {
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  transition: all var(--transition-fast);
}

.social-btn:hover {
  color: var(--accent-color);
  background: rgba(0, 212, 170, 0.1);
  transform: translateY(-2px);
}

.social-btn .icon {
  width: 20px;
  height: 20px;
}

.footer-divider {
  border: none;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin: 2rem 0;
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-copyright {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.footer-disclaimer {
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.75rem;
  font-style: italic;
}

@media (max-width: 1024px) {
  .footer-grid {
    grid-template-columns: 1fr 1fr;
    gap: 3rem 2rem;
  }
}

@media (max-width: 600px) {
  .footer-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
}
</style>
