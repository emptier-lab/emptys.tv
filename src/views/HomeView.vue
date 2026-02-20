<template>
  <div class="home-view">
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">
          <span class="line">Stream</span>
          <span class="line">everything.</span>
        </h1>
        <p class="hero-subtitle">
          No subscriptions. No tracking. Pure cinematic focus.
        </p>
        <div class="hero-actions">
          <router-link to="/movies" class="action-link">
            Start Watching
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="arrow-icon">
              <path stroke="currentColor" stroke-width="2" stroke-linecap="square" d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </router-link>
          <router-link to="/tv-shows" class="action-link muted">
            Browse Series
          </router-link>
        </div>
      </div>
    </section>

    <section class="manifesto-section container">
      <div class="grid-layout">
        <div class="grid-item">
          <h3>01 / Free</h3>
          <p>Direct sourcing from vast indexes. The entire TMDB catalog at your disposal without cost or compromise.</p>
        </div>
        <div class="grid-item">
          <h3>02 / Fast</h3>
          <p>Built on modern standards. Zero overhead, instantaneous navigation, minimal payload.</p>
        </div>
        <div class="grid-item">
          <h3>03 / Clean</h3>
          <p>A rejection of generic templates. Focus entirely on the media.</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'HomeView'
}
</script>

<style scoped>
.home-view {
  min-height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);
  display: flex;
  flex-direction: column;
}

.hero-section {
  flex: 1;
  display: flex;
  align-items: center;
  padding: 0 5%;
  min-height: 80vh;
  border-bottom: 1px solid var(--border-color);
}

.hero-content {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.hero-title {
  font-size: clamp(4rem, 12vw, 10rem);
  font-weight: 800;
  line-height: 0.9;
  letter-spacing: -0.06em;
  text-transform: lowercase;
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
}

.hero-title .line {
  display: block;
}

.hero-subtitle {
  font-size: clamp(1rem, 2vw, 1.5rem);
  color: var(--text-secondary);
  font-weight: 400;
  max-width: 600px;
  margin-bottom: 4rem;
  line-height: 1.4;
  letter-spacing: -0.02em;
}

.hero-actions {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.action-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  text-decoration: none;
  border-bottom: 1px solid var(--text-primary);
  padding-bottom: 0.25rem;
  transition: opacity var(--transition-fast), gap var(--transition-fast);
}

.action-link:hover {
  opacity: 0.7;
  gap: 0.75rem;
}

.action-link.muted {
  color: var(--text-secondary);
  border-color: transparent;
}

.action-link.muted:hover {
  color: var(--text-primary);
}

.arrow-icon {
  margin-top: 2px;
}

.manifesto-section {
  padding: 6rem 5%;
}

.grid-layout {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.grid-item {
  border-top: 1px solid var(--text-primary);
  padding-top: 1.5rem;
}

.grid-item h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.grid-item p {
  color: var(--text-secondary);
  font-size: 1rem;
  line-height: 1.6;
}

@media (max-width: 900px) {
  .grid-layout {
    grid-template-columns: 1fr;
    gap: 4rem;
  }
  
  .hero-actions {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
