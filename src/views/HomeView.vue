<template>
  <div class="home-view">
    <section class="hero" v-if="featured">
      <div class="hero-backdrop">
        <img
          v-if="featuredBackdrop"
          :src="featuredBackdrop"
          :alt="featured.title || featured.name"
          class="hero-bg"
          :key="featured.id + '-bg'"
        />
        <div class="hero-gradient"></div>
        <div class="hero-vignette"></div>
      </div>

      <div class="hero-content container">
        <div class="hero-info" :key="featured.id">
          <div class="hero-meta">
            <span class="hero-badge">Trending</span>
            <span v-if="featured.vote_average" class="hero-rating">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--amber)"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
              {{ formatRating(featured.vote_average) }}
            </span>
            <span v-if="featuredYear" class="hero-year">{{ featuredYear }}</span>
          </div>

          <img
            v-if="heroLogo"
            :src="heroLogo"
            :alt="featured.title || featured.name"
            class="hero-logo"
          />
          <h1 v-else class="hero-title">{{ featured.title || featured.name }}</h1>

          <p class="hero-overview">{{ truncateOverview(featured.overview) }}</p>

          <div class="hero-actions">
            <button class="hero-btn hero-btn--play" @click="goToWatch(featured)">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              Watch Now
            </button>
            <button class="hero-btn hero-btn--info" @click="goToDetail(featured)">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              More Info
            </button>
          </div>
        </div>

        <div class="hero-indicators">
          <button
            v-for="(item, i) in trendingItems.slice(0, 5)"
            :key="item.id"
            class="indicator"
            :class="{ active: i === currentIndex }"
            @click="setFeatured(i)"
          >
            <div class="indicator-progress" :class="{ running: i === currentIndex && !isPaused }"></div>
          </button>
        </div>
      </div>
    </section>

    <section class="hero hero--skeleton" v-else>
      <div class="hero-backdrop">
        <div class="skeleton-bg"></div>
      </div>
      <div class="hero-content container">
        <div class="hero-info">
          <div class="skeleton-line" style="width:100px;height:20px;margin-bottom:12px"></div>
          <div class="skeleton-line" style="width:60%;height:48px;margin-bottom:16px"></div>
          <div class="skeleton-line" style="width:80%;height:16px;margin-bottom:8px"></div>
          <div class="skeleton-line" style="width:50%;height:16px;margin-bottom:28px"></div>
          <div style="display:flex;gap:12px">
            <div class="skeleton-line" style="width:140px;height:48px;border-radius:99px"></div>
            <div class="skeleton-line" style="width:140px;height:48px;border-radius:99px"></div>
          </div>
        </div>
      </div>
    </section>

    <div class="content-area container">
      <section class="content-row" v-if="top10Movies.length">
        <div class="section-header">
          <h2 class="section-title">Top 10 Movies Today</h2>
        </div>
        <div class="scroll-row top10-row">
          <div
            v-for="(item, i) in top10Movies"
            :key="'t10-' + item.id"
            class="top10-item"
            @click="goToDetail(item)"
          >
            <span class="top10-rank">{{ i + 1 }}</span>
            <div class="top10-poster">
              <img
                v-if="getPosterUrl(item)"
                :src="getPosterUrl(item)"
                :alt="item.title || item.name"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      <section class="content-row" v-if="popularMovies.length">
        <div class="section-header">
          <h2 class="section-title">Popular Movies</h2>
          <router-link to="/movies" class="section-link">View All →</router-link>
        </div>
        <div class="scroll-row">
          <MediaCard
            v-for="item in popularMovies"
            :key="'pm-' + item.id"
            :item="item"
            media-type="movie"
            class="scroll-card"
          />
        </div>
      </section>

      <section class="content-row" v-if="popularTV.length">
        <div class="section-header">
          <h2 class="section-title">Popular TV Shows</h2>
          <router-link to="/tv-shows" class="section-link">View All →</router-link>
        </div>
        <div class="scroll-row">
          <MediaCard
            v-for="item in popularTV"
            :key="'pt-' + item.id"
            :item="item"
            media-type="tv"
            class="scroll-card"
          />
        </div>
      </section>

      <section class="content-row" v-if="topRatedMovies.length">
        <div class="section-header">
          <h2 class="section-title">Top Rated</h2>
          <router-link to="/movies" class="section-link">View All →</router-link>
        </div>
        <div class="scroll-row">
          <MediaCard
            v-for="item in topRatedMovies"
            :key="'tr-' + item.id"
            :item="item"
            media-type="movie"
            class="scroll-card"
          />
        </div>
      </section>

      <section class="content-row" v-if="upcoming.length">
        <div class="section-header">
          <h2 class="section-title">Coming Soon</h2>
          <router-link to="/movies" class="section-link">View All →</router-link>
        </div>
        <div class="scroll-row">
          <MediaCard
            v-for="item in upcoming"
            :key="'up-' + item.id"
            :item="item"
            media-type="movie"
            class="scroll-card"
          />
        </div>
      </section>

      <section class="content-row" v-if="airingToday.length">
        <div class="section-header">
          <h2 class="section-title">Airing Today</h2>
          <router-link to="/tv-shows" class="section-link">View All →</router-link>
        </div>
        <div class="scroll-row">
          <MediaCard
            v-for="item in airingToday"
            :key="'at-' + item.id"
            :item="item"
            media-type="tv"
            class="scroll-card"
          />
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { tmdbService, imageService, utilsService } from '@/services/tmdb'
import MediaCard from '@/components/common/MediaCard.vue'

export default {
  name: 'HomeView',
  components: { MediaCard },
  setup() {
    const router = useRouter()
    const trendingItems = ref([])
    const popularMovies = ref([])
    const popularTV = ref([])
    const topRatedMovies = ref([])
    const upcoming = ref([])
    const airingToday = ref([])
    const top10Movies = ref([])
    const currentIndex = ref(0)
    const isPaused = ref(false)
    const heroLogo = ref(null)
    const logoCache = {}
    let heroInterval = null

    const featured = computed(() => trendingItems.value[currentIndex.value] || null)
    const featuredBackdrop = computed(() =>
      featured.value ? imageService.getBackdropUrl(featured.value.backdrop_path, 'original') : null
    )
    const featuredYear = computed(() => {
      if (!featured.value) return ''
      const d = featured.value.release_date || featured.value.first_air_date
      return d ? utilsService.getYear(d) : ''
    })

    function formatRating(v) { return utilsService.formatVoteAverage(v) }

    function truncateOverview(text) {
      if (!text) return ''
      return text.length > 180 ? text.slice(0, 180) + '…' : text
    }

    function getPosterUrl(item) {
      return imageService.getPosterUrl(item.poster_path, 'w342')
    }

    async function fetchLogoForItem(item) {
      if (!item) { heroLogo.value = null; return }
      const cacheKey = `${item.media_type || 'movie'}-${item.id}`
      if (logoCache[cacheKey] !== undefined) {
        heroLogo.value = logoCache[cacheKey]
        return
      }
      try {
        const isTV = item.media_type === 'tv' || item.first_air_date
        const images = isTV
          ? await tmdbService.getTVImages(item.id)
          : await tmdbService.getMovieImages(item.id)
        const logos = (images.logos || []).filter(l => l.iso_639_1 === 'en')
        if (logos.length > 0) {
          const url = imageService.getLogoUrl(logos[0].file_path, 'w500')
          logoCache[cacheKey] = url
          heroLogo.value = url
        } else {
          logoCache[cacheKey] = null
          heroLogo.value = null
        }
      } catch {
        logoCache[cacheKey] = null
        heroLogo.value = null
      }
    }

    function setFeatured(i) {
      currentIndex.value = i
      resetInterval()
    }

    function goToWatch(item) {
      const type = item.media_type === 'tv' || item.first_air_date ? 'tv' : 'movie'
      router.push(`/watch/${type}/${item.id}`)
    }

    function goToDetail(item) {
      const type = item.media_type === 'tv' || item.first_air_date ? 'tv' : 'movie'
      router.push(`/${type}/${item.id}`)
    }

    function resetInterval() {
      if (heroInterval) clearInterval(heroInterval)
      heroInterval = setInterval(() => {
        if (!isPaused.value && trendingItems.value.length > 0) {
          currentIndex.value = (currentIndex.value + 1) % Math.min(trendingItems.value.length, 5)
        }
      }, 7000)
    }

    watch(currentIndex, () => {
      fetchLogoForItem(featured.value)
    })

    async function loadData() {
      const [trending, popMov, popTv, topMov, upcom, airing] = await Promise.allSettled([
        tmdbService.getTrending('all', 'day'),
        tmdbService.getPopularMovies(),
        tmdbService.getPopularTV(),
        tmdbService.getTopRatedMovies(),
        tmdbService.getUpcomingMovies(),
        tmdbService.getAiringTodayTV()
      ])

      if (trending.status === 'fulfilled') {
        const results = (trending.value.results || []).filter(m => m.backdrop_path)
        trendingItems.value = results
        top10Movies.value = results
          .filter(m => m.media_type === 'movie' || m.title)
          .slice(0, 10)
        if (results.length) fetchLogoForItem(results[0])
      }
      if (popMov.status === 'fulfilled') popularMovies.value = popMov.value.results || []
      if (popTv.status === 'fulfilled') popularTV.value = popTv.value.results || []
      if (topMov.status === 'fulfilled') topRatedMovies.value = topMov.value.results || []
      if (upcom.status === 'fulfilled') upcoming.value = upcom.value.results || []
      if (airing.status === 'fulfilled') airingToday.value = airing.value.results || []
    }

    onMounted(() => {
      loadData()
      resetInterval()
    })

    onUnmounted(() => {
      if (heroInterval) clearInterval(heroInterval)
    })

    return {
      trendingItems,
      popularMovies,
      popularTV,
      topRatedMovies,
      upcoming,
      airingToday,
      top10Movies,
      featured,
      featuredBackdrop,
      featuredYear,
      currentIndex,
      isPaused,
      heroLogo,
      formatRating,
      truncateOverview,
      getPosterUrl,
      setFeatured,
      goToWatch,
      goToDetail
    }
  }
}
</script>

<style scoped>
.home-view {
  min-height: 100vh;
  background: var(--bg-primary);
}

.hero {
  position: relative;
  min-height: 85vh;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
}

.hero--skeleton {
  min-height: 85vh;
}

.hero-backdrop {
  position: absolute;
  inset: 0;
}

.hero-bg {
  width: 100%;
  height: 100%;
  object-fit: cover;
  animation: fadeIn 0.8s ease;
}

.hero-gradient {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(to top, var(--bg-primary) 0%, transparent 50%),
    linear-gradient(to right, rgba(10, 10, 15, 0.85) 0%, transparent 60%),
    linear-gradient(to bottom, rgba(10, 10, 15, 0.3) 0%, transparent 30%);
}

.hero-vignette {
  position: absolute;
  inset: 0;
  box-shadow: inset 0 0 200px rgba(0, 0, 0, 0.5);
}

.hero-content {
  position: relative;
  z-index: 2;
  width: 100%;
  padding-bottom: 60px;
}

.hero-info {
  max-width: 600px;
  animation: fadeInUp 0.6s ease-out;
}

.hero-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.hero-badge {
  background: var(--accent);
  color: #fff;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 4px 12px;
  border-radius: var(--border-radius-full);
}

.hero-rating {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--amber);
}

.hero-year {
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.hero-logo {
  max-width: 400px;
  max-height: 140px;
  width: auto;
  height: auto;
  object-fit: contain;
  margin-bottom: 18px;
  filter: drop-shadow(0 4px 24px rgba(0, 0, 0, 0.6));
  animation: fadeInUp 0.5s ease-out;
}

.hero-title {
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 800;
  line-height: 1.05;
  letter-spacing: -0.03em;
  margin-bottom: 14px;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.5);
}

.hero-overview {
  font-size: 0.95rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 28px;
  max-width: 500px;
}

.hero-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.hero-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: none;
  border-radius: var(--border-radius-full);
  font-weight: 600;
  font-size: 0.9rem;
  padding: 14px 28px;
  cursor: pointer;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}

.hero-btn:hover {
  transform: scale(1.04);
}

.hero-btn--play {
  background: var(--text-primary);
  color: var(--bg-primary);
  box-shadow: 0 4px 24px rgba(255, 255, 255, 0.15);
}

.hero-btn--play:hover {
  box-shadow: 0 6px 32px rgba(255, 255, 255, 0.25);
}

.hero-btn--info {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.hero-btn--info:hover {
  background: rgba(255, 255, 255, 0.15);
}

.hero-indicators {
  display: flex;
  gap: 6px;
  margin-top: 32px;
}

.indicator {
  width: 48px;
  height: 3px;
  background: rgba(255, 255, 255, 0.15);
  border: none;
  border-radius: 2px;
  cursor: pointer;
  overflow: hidden;
  padding: 0;
  transition: background var(--transition-fast);
}

.indicator:hover {
  background: rgba(255, 255, 255, 0.25);
}

.indicator.active {
  background: rgba(255, 255, 255, 0.2);
}

.indicator-progress {
  height: 100%;
  width: 0;
  background: var(--accent);
  border-radius: 2px;
}

.indicator.active .indicator-progress.running {
  width: 100%;
  transition: width 7s linear;
}

.skeleton-bg {
  width: 100%;
  height: 100%;
  background: var(--bg-secondary);
}

.skeleton-line {
  background: linear-gradient(90deg, var(--bg-tertiary) 25%, rgba(255,255,255,0.04) 50%, var(--bg-tertiary) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--border-radius-sm);
}

.content-area {
  padding-top: 20px;
  padding-bottom: 80px;
}

.content-row {
  margin-bottom: 48px;
}

.scroll-card {
  width: 160px;
}

@media (min-width: 768px) {
  .scroll-card {
    width: 180px;
  }
}

/* TOP 10 */
.top10-row {
  gap: 4px;
}

.top10-item {
  display: flex;
  align-items: flex-end;
  cursor: pointer;
  flex-shrink: 0;
  position: relative;
  height: 200px;
}

.top10-rank {
  font-size: 9rem;
  font-weight: 900;
  line-height: 0.75;
  color: transparent;
  -webkit-text-stroke: 2px rgba(255, 255, 255, 0.25);
  letter-spacing: -0.08em;
  user-select: none;
  margin-right: -16px;
  z-index: 1;
  font-family: var(--font-sans);
}

.top10-poster {
  width: 120px;
  height: 180px;
  border-radius: var(--border-radius-md);
  overflow: hidden;
  flex-shrink: 0;
  position: relative;
  z-index: 2;
  transition: transform var(--transition-normal);
}

.top10-item:hover .top10-poster {
  transform: scale(1.05);
}

.top10-poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@media (max-width: 600px) {
  .hero {
    min-height: 75vh;
  }

  .hero-logo {
    max-width: 260px;
    max-height: 90px;
  }

  .hero-title {
    font-size: 1.8rem;
  }

  .hero-overview {
    font-size: 0.85rem;
  }

  .hero-btn {
    padding: 12px 22px;
    font-size: 0.85rem;
  }

  .scroll-card {
    width: 130px;
  }

  .top10-rank {
    font-size: 6rem;
  }

  .top10-poster {
    width: 90px;
    height: 135px;
  }

  .top10-item {
    height: 150px;
  }
}
</style>
