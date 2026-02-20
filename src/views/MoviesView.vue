<template>
  <div class="movies-view page-layout">
    <div class="header-section">
      <div class="header-content">
        <h1 class="page-title">Explore Movies</h1>
        <p class="page-subtitle">Discover the cinematic universe.</p>
      </div>
    </div>

    <div class="page-container">
      <!-- Filter Section (Glassmorphic Bento Grid) -->
      <div class="filter-dashboard">
        <div class="filter-grid">
          <div class="filter-item">
            <span class="filter-label">Category</span>
            <div class="select-wrapper">
              <select v-model="selectedCategory">
                <option v-for="cat in categories" :key="cat.value" :value="cat.value">{{ cat.title }}</option>
              </select>
              <svg class="select-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M7 10l5 5 5-5z"/></svg>
            </div>
          </div>
          
          <div class="filter-item">
            <span class="filter-label">Genre</span>
            <div class="select-wrapper">
              <select v-model="selectedGenre">
                <option :value="null">All Genres</option>
                <option v-for="gen in genres" :key="gen.value" :value="gen.value">{{ gen.title }}</option>
              </select>
              <svg class="select-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M7 10l5 5 5-5z"/></svg>
            </div>
          </div>

          <div class="filter-item">
            <span class="filter-label">Network</span>
            <div class="select-wrapper">
              <select v-model="selectedNetwork">
                <option :value="null">All Networks</option>
                <option v-for="net in networks" :key="net.value" :value="net.value">{{ net.title }}</option>
              </select>
              <svg class="select-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M7 10l5 5 5-5z"/></svg>
            </div>
          </div>

          <div class="filter-item">
            <span class="filter-label">Year</span>
            <div class="select-wrapper">
              <select v-model="selectedYear">
                <option :value="null">Any Year</option>
                <option v-for="yr in years" :key="yr.value" :value="yr.value">{{ yr.title }}</option>
              </select>
              <svg class="select-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M7 10l5 5 5-5z"/></svg>
            </div>
          </div>

          <div class="filter-item">
            <span class="filter-label">Sort By</span>
            <div class="select-wrapper">
              <select v-model="sortBy">
                <option v-for="srt in sortOptions" :key="srt.value" :value="srt.value">{{ srt.title }}</option>
              </select>
              <svg class="select-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M7 10l5 5 5-5z"/></svg>
            </div>
          </div>
          
          <div class="filter-item">
            <span class="filter-label">Audience</span>
            <div class="select-wrapper">
              <select v-model="selectedAudience">
                <option :value="null">Any</option>
                <option v-for="aud in audienceTypes" :key="aud.value" :value="aud.value">{{ aud.title }}</option>
              </select>
              <svg class="select-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M7 10l5 5 5-5z"/></svg>
            </div>
          </div>
          
          <div class="filter-item">
            <span class="filter-label">Theme</span>
            <div class="select-wrapper">
              <select v-model="selectedTheme">
                <option :value="null">Any</option>
                <option v-for="thm in themeTypes" :key="thm.value" :value="thm.value">{{ thm.title }}</option>
              </select>
              <svg class="select-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M7 10l5 5 5-5z"/></svg>
            </div>
          </div>
        </div>

        <div class="keyword-chips">
          <button
            v-for="keyword in keywordOptions"
            :key="keyword.value"
            :class="['chip-btn', { 'active': selectedKeywords.includes(keyword.value) }]"
            @click="toggleKeyword(keyword.value)"
          >
            {{ keyword.title }}
          </button>
        </div>
      </div>

      <!-- Grid -->
      <div v-if="movies.length > 0" class="movies-section">
        <LazyGrid
          :items="movies"
          :loading="loadingMore"
          :has-more-content="hasMoreMovies"
          grid-class="media-grid media-grid--large"
          @load-more="loadMoreMovies"
        >
          <template #item="{ item }">
            <div class="card-wrap">
              <MediaCard :item="item" media-type="movie" />
            </div>
          </template>

          <template #loading>
            <div class="loader-box">
              <div class="loader-circle"></div>
              <p>Fetching movies...</p>
            </div>
          </template>

          <template #empty>
            <div class="loader-box">
              <p>No movies matched your strict criteria.</p>
            </div>
          </template>

          <template #footer>
            <div v-if="!hasMoreMovies && movies.length > 0" class="end-of-results">
              <div class="end-mark"></div>
              <p>You've seen it all.</p>
            </div>
          </template>
        </LazyGrid>
      </div>

      <!-- State: Loading Array -->
      <div v-else-if="loading" class="state-overlay">
        <div class="loader-circle"></div>
      </div>

      <!-- State: Error -->
      <div v-else-if="error" class="state-overlay error">
        <h2>Connection Lost</h2>
        <p>{{ error }}</p>
        <button @click="loadMovies" class="retry-btn">Reconnect</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import MediaCard from '@/components/common/MediaCard.vue'
import LazyGrid from '@/components/common/LazyGrid.vue'
import { tmdbService } from '@/services/tmdb'

export default {
  name: 'MoviesView',
  components: {
    MediaCard,
    LazyGrid
  },
  setup() {
    const movies = ref([])
    const movieGenres = ref([])
    const loading = ref(true)
    const loadingMore = ref(false)
    const error = ref(null)
    const currentPage = ref(1)
    const totalPages = ref(0)
    const infiniteScrollEnabled = ref(true)
    const scrollThreshold = ref(800) // Increased threshold to detect scroll earlier
    const lastLoadTime = ref(0)
    const minLoadInterval = 1000 // Minimum 1 second between loads


    const selectedCategory = ref('popular')
    const selectedGenre = ref(null)
    const selectedYear = ref(null)
    const selectedNetwork = ref(null)
    const sortBy = ref('popularity.desc')
    const selectedAudience = ref(null)
    const selectedTheme = ref(null)
    const selectedKeywords = ref([])
    const autoApplyTimer = ref(null)

    const categories = [
      { title: 'Popular', value: 'popular' },
      { title: 'Top Rated', value: 'top_rated' },
      { title: 'Now Playing', value: 'now_playing' },
      { title: 'Upcoming', value: 'upcoming' },
      { title: 'Discover', value: 'discover' },
      { title: 'Underground', value: 'underground' },
      { title: 'Hidden Gems', value: 'hidden_gems' }
    ]

    const sortOptions = [
      { title: 'Most Popular', value: 'popularity.desc' },
      { title: 'Highest Rated', value: 'vote_average.desc' },
      { title: 'Underground', value: 'vote_count.asc' },
      { title: 'Least Popular', value: 'popularity.asc' },
      { title: 'Newest First', value: 'release_date.desc' },
      { title: 'Oldest First', value: 'release_date.asc' },
      { title: 'Title A-Z', value: 'title.asc' },
      { title: 'Title Z-A', value: 'title.desc' }
    ]

    const networks = [
      { title: 'All Networks', value: null },
      { title: 'Netflix', value: 213 },
      { title: 'HBO', value: 49 },
      { title: 'Amazon', value: 1024 },
      { title: 'Disney+', value: 2739 },
      { title: 'Hulu', value: 453 },
      { title: 'Apple TV+', value: 2552 },
      { title: 'BBC', value: 4 }
    ]

    const audienceTypes = [
      { title: 'All Audiences', value: null },
      { title: 'Kids', value: 'kids' },
      { title: 'Family', value: 'family' },
      { title: 'Teens', value: 'teens' },
      { title: 'Adults', value: 'adult' },
      { title: 'Mature', value: 'mature' }
    ]

    const themeTypes = [
      { title: 'All Themes', value: null },
      { title: 'Superpowers', value: 'superpowers' },
      { title: 'Magic', value: 'magic' },
      { title: 'Dystopian', value: 'dystopian' },
      { title: 'Space', value: 'space' },
      { title: 'Monsters', value: 'monsters' },
      { title: 'Survival', value: 'survival' },
      { title: 'Supernatural', value: 'supernatural' }
    ]

    const keywordOptions = [
      { title: 'Indie', value: 'indie' },
      { title: 'Underrated', value: 'underrated' },
      { title: 'Cult', value: 'cult' },
      { title: 'Dark', value: 'dark' },
      { title: 'Gritty', value: 'gritty' },
      { title: 'Quirky', value: 'quirky' }
    ]

    const genres = computed(() => [
      { title: 'All Genres', value: null },
      ...movieGenres.value.map(genre => ({
        title: genre.name,
        value: genre.id
      }))
    ])

    const years = computed(() => {
      const currentYear = new Date().getFullYear()
      const yearList = [{ title: 'All Years', value: null }]
      for (let year = currentYear; year >= 1900; year--) {
        yearList.push({ title: year.toString(), value: year })
      }
      return yearList
    })

    const hasMoreMovies = computed(() => {
      return currentPage.value < totalPages.value && currentPage.value < 500
    })

    async function fetchMovies(page) {
      const hasAdditionalFilters = selectedGenre.value || selectedYear.value ||
          selectedNetwork.value || selectedAudience.value || selectedTheme.value ||
          selectedKeywords.value.length > 0 || sortBy.value !== 'popularity.desc'

      if (hasAdditionalFilters || selectedCategory.value === 'discover') {
        const params = {
          sort_by: sortBy.value,
          page: page
        }

        if (selectedCategory.value !== 'discover') {
          switch (selectedCategory.value) {
            case 'top_rated':
              params.vote_average_gte = 7
              params.vote_count_gte = 100
              if (sortBy.value === 'popularity.desc') params.sort_by = 'vote_average.desc'
              break
            case 'now_playing':
              const now = new Date()
              const monthAgo = new Date(now.setMonth(now.getMonth() - 1))
              params.primary_release_date_gte = monthAgo.toISOString().split('T')[0]
              params.primary_release_date_lte = new Date().toISOString().split('T')[0]
              break
            case 'upcoming':
              const tomorrow = new Date()
              tomorrow.setDate(tomorrow.getDate() + 1)
              params.primary_release_date_gte = tomorrow.toISOString().split('T')[0]
              break
            case 'underground':
              params.vote_count_gte = 20
              params.vote_count_lte = 500
              if (sortBy.value === 'popularity.desc') params.sort_by = 'vote_average.desc'
              break
            case 'hidden_gems':
              params.vote_count_gte = 50
              params.vote_count_lte = 500
              params.vote_average_gte = 7
              if (sortBy.value === 'popularity.desc') params.sort_by = 'vote_average.desc'
              break
          }
        }

        if (selectedGenre.value) params.with_genres = selectedGenre.value
        if (selectedYear.value) params.year = selectedYear.value
        if (selectedNetwork.value) params.with_networks = selectedNetwork.value

        if (selectedAudience.value) {
          switch(selectedAudience.value) {
            case 'kids': params.certification_country = 'US'; params.certification = 'G'; break
            case 'family': params.certification_country = 'US'; params.certification_lte = 'PG'; break
            case 'teens': params.certification_country = 'US'; params.certification = 'PG-13'; break
            case 'adult': params.certification_country = 'US'; params.certification_gte = 'R'; break
            case 'mature': params.certification_country = 'US'; params.certification = 'NC-17'; break
          }
        }

        let allKeywords = []
        if (selectedTheme.value) {
          const themeKeywords = {
            'superpowers': 849, 'magic': 616, 'dystopian': 4458, 'space': 9951,
            'monsters': 10224, 'survival': 10292, 'supernatural': 6152
          }
          if (themeKeywords[selectedTheme.value]) allKeywords.push(themeKeywords[selectedTheme.value])
        }

        if (selectedKeywords.value.length > 0) {
          const keywordMap = {
            'indie': 185101, 'underrated': 196372, 'cult': 5990,
            'dark': 10183, 'gritty': 184910, 'quirky': 194662
          }
          const keywordIds = selectedKeywords.value.map(k => keywordMap[k]).filter(Boolean)
          allKeywords = allKeywords.concat(keywordIds)
        }

        if (allKeywords.length > 0) {
          params.with_keywords = allKeywords.join(',')
        }

        params.include_adult = false
        return await tmdbService.discoverMovies(params)
      } else {
        switch (selectedCategory.value) {
          case 'popular': return await tmdbService.getPopularMovies(page)
          case 'top_rated': return await tmdbService.getTopRatedMovies(page)
          case 'now_playing': return await tmdbService.getNowPlayingMovies(page)
          case 'upcoming': return await tmdbService.getUpcomingMovies(page)
          case 'underground': return await tmdbService.discoverMovies({ sort_by: 'vote_average.desc', vote_count_gte: 20, vote_count_lte: 500, page })
          case 'hidden_gems': return await tmdbService.discoverMovies({ sort_by: 'vote_average.desc', vote_count_gte: 50, vote_count_lte: 500, vote_average_gte: 7, page })
          default: return await tmdbService.getPopularMovies(page)
        }
      }
    }

    async function loadMovies() {
      loading.value = true
      error.value = null
      currentPage.value = 1
      movies.value = []

      try {
        const response = await fetchMovies(currentPage.value)
        movies.value = response.results || []
        totalPages.value = response.total_pages || 0
        console.log('Movies loaded:', movies.value.length, 'Total pages:', totalPages.value)
      } catch (err) {
        console.error('Error loading movies:', err)
        error.value = err.message || 'Failed to load movies'
      } finally {
        loading.value = false
      }
    }

    async function loadMoreMovies() {
      if (!hasMoreMovies.value || loadingMore.value) return

      const now = Date.now()
      if (now - lastLoadTime.value < minLoadInterval) return
      lastLoadTime.value = now

      loadingMore.value = true
      currentPage.value += 1

      try {
        const response = await fetchMovies(currentPage.value)
        movies.value.push(...(response.results || []))
        totalPages.value = response.total_pages || totalPages.value
      } catch (err) {
        console.error('Failed to load more movies:', err)
      } finally {
        loadingMore.value = false
      }
    }

    async function loadGenres() {
      try {
        const response = await tmdbService.getMovieGenres()
        movieGenres.value = response.genres || []
      } catch (err) {
        console.error('Failed to load genres:', err)
      }
    }

    // Add watchers for all filter values to trigger loadMovies
    // Watch all filters including network
    watch(selectedCategory, () => loadMovies())
    watch(selectedGenre, () => loadMovies())
    watch(selectedYear, () => loadMovies())
    watch(selectedNetwork, () => loadMovies())
    watch(sortBy, () => loadMovies())
    watch(selectedAudience, () => loadMovies())
    watch(selectedTheme, () => loadMovies())

    // Special handling for keywords with debounce
    watch(selectedKeywords, () => {
      if (autoApplyTimer.value) clearTimeout(autoApplyTimer.value)
      autoApplyTimer.value = setTimeout(() => {
        loadMovies()
      }, 300)
    })

    function toggleKeyword(value) {
      const index = selectedKeywords.value.indexOf(value)
      if (index === -1) {
        selectedKeywords.value = [...selectedKeywords.value, value]
      } else {
        selectedKeywords.value = selectedKeywords.value.filter(k => k !== value)
      }
    }

    function loadNetworks() {
      // Networks are static for now
      console.log('Networks loaded')
    }

    // LazyGrid handles scrolling automatically, so we don't need these scroll handlers
    onMounted(() => {
      loadGenres()
      loadNetworks()
      loadMovies()
    })

    return {
      movies,
      loading,
      loadingMore,
      error,
      selectedCategory,
      selectedGenre,
      selectedYear,
      selectedNetwork,
      sortBy,
      selectedAudience,
      selectedTheme,
      selectedKeywords,
      categories,
      genres,
      years,
      networks,
      sortOptions,
      audienceTypes,
      themeTypes,
      keywordOptions,
      hasMoreMovies,
      infiniteScrollEnabled,
      loadMovies,
      loadMoreMovies,
      toggleKeyword
    }
  }
}
</script>

<style scoped>
.page-layout {
  min-height: 100vh;
  background: var(--bg-primary);
  padding-top: 100px;
}

.page-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem 4rem;
}

.header-section {
  text-align: center;
  padding: 40px 0;
  margin-bottom: 2rem;
  border-bottom: 1px solid var(--border-color);
}

.page-title {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 800;
  letter-spacing: -0.05em;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.1;
  text-transform: lowercase;
}

.page-subtitle {
  font-size: 1.25rem;
  color: var(--text-secondary);
  margin-top: 8px;
}

.filter-dashboard {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  padding: 24px;
  margin-bottom: 40px;
}

.filter-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 24px;
}

.filter-item {
  flex: 1;
  min-width: 140px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.select-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.select-wrapper select {
  width: 100%;
  appearance: none;
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  padding: 12px 36px 12px 16px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  outline: none;
  border-radius: 0;
}

.select-wrapper select:hover,
.select-wrapper select:focus {
  border-color: var(--text-primary);
}

.select-wrapper select option {
  background: var(--bg-primary);
  color: var(--text-primary);
}

.select-icon {
  position: absolute;
  right: 12px;
  width: 20px;
  height: 20px;
  color: var(--text-secondary);
  pointer-events: none;
}

.keyword-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
}

.chip-btn {
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  padding: 6px 16px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.chip-btn:hover {
  color: var(--text-primary);
  border-color: var(--text-primary);
}

.chip-btn.active {
  background: var(--text-primary);
  color: var(--bg-primary);
  border-color: var(--text-primary);
}

.card-wrap {
  width: 100%;
}

.loader-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
  color: var(--text-secondary);
}

.loader-circle {
  width: 40px;
  height: 40px;
  border: 2px solid var(--border-color);
  border-top-color: var(--text-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.end-of-results {
  text-align: center;
  padding: 3rem 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.state-overlay {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 40vh;
}

.state-overlay.error h2 {
  color: var(--text-primary);
  margin-bottom: 8px;
}

.state-overlay.error p {
  color: var(--text-secondary);
  margin-bottom: 24px;
}

.retry-btn {
  background: transparent;
  color: var(--text-primary);
  border: 1px solid var(--text-primary);
  padding: 10px 24px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.retry-btn:hover {
  background: var(--text-primary);
  color: var(--bg-primary);
}

@media (max-width: 768px) {
  .page-container {
    padding: 0 1rem 2rem;
  }
  
  .filter-dashboard {
    padding: 16px;
  }
}
</style>
