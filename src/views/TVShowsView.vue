<template>
  <div class="tv-shows-view page-layout">
    <div class="header-section">
      <div class="header-content">
        <h1 class="page-title">Explore TV Shows</h1>
        <p class="page-subtitle">Discover amazing TV series.</p>
      </div>
    </div>

    <div class="page-container">
      <!-- Filter Section (Minimalist Grid) -->
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
      <div v-if="tvShows.length > 0" class="tv-section">
        <LazyGrid
          :items="tvShows"
          :loading="loadingMore"
          :has-more-content="hasMoreTVShows"
          grid-class="media-grid media-grid--large"
          @load-more="loadMoreShows"
        >
          <template #item="{ item }">
            <div class="card-wrap">
              <MediaCard :item="item" media-type="tv" />
            </div>
          </template>

          <template #loading>
            <div class="loader-box">
              <div class="loader-circle"></div>
              <p>Fetching TV shows...</p>
            </div>
          </template>

          <template #empty>
            <div class="loader-box">
              <p>No TV shows matched your strict criteria.</p>
            </div>
          </template>

          <template #footer>
            <div v-if="!hasMoreTVShows && tvShows.length > 0" class="end-of-results">
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
        <button @click="loadTVShows" class="retry-btn">Reconnect</button>
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
  name: 'TVShowsView',
  components: {
    MediaCard,
    LazyGrid
  },
  setup() {
    const tvShows = ref([])
    const tvGenres = ref([])
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
      { title: 'On The Air', value: 'on_the_air' },
      { title: 'Airing Today', value: 'airing_today' },
      { title: 'Discover', value: 'discover' },
      { title: 'Underground', value: 'underground' },
      { title: 'Hidden Gems', value: 'hidden_gems' }
    ]

    const sortOptions = [
      { title: 'Most Popular', value: 'popularity.desc' },
      { title: 'Highest Rated', value: 'vote_average.desc' },
      { title: 'Newest First', value: 'first_air_date.desc' },
      { title: 'Oldest First', value: 'first_air_date.asc' },
      { title: 'Title A-Z', value: 'name.asc' },
      { title: 'Title Z-A', value: 'name.desc' }
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
      ...tvGenres.value.map(genre => ({
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

    const hasMoreTVShows = computed(() => {
      return currentPage.value < totalPages.value && currentPage.value < 500
    })

    async function fetchTVShows(page) {
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
            case 'on_the_air':
            case 'airing_today':
              const now = new Date()
              params.first_air_date_lte = now.toISOString().split('T')[0]
              break
            case 'underground':
              params.vote_count_gte = 20
              params.vote_count_lte = 300
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
        if (selectedYear.value) params.first_air_date_year = selectedYear.value
        if (selectedNetwork.value) params.with_networks = selectedNetwork.value

        if (sortBy.value === 'vote_count.asc' || selectedCategory.value === 'underground') {
          params.vote_count_gte = 20
          params.vote_count_lte = 500
        }

        if (selectedAudience.value) {
          switch(selectedAudience.value) {
            case 'kids': params.with_keywords = 9840; break
            case 'family': params.with_keywords = 10751; break
            case 'teens': params.with_keywords = 9714; break
            case 'adult': params.with_keywords = 12623; break
            case 'mature': params.include_adult = true; break
          }
        }

        let allKeywords = []
        if (selectedTheme.value) {
          const themeKeywordMap = {
            'superpowers': 9715, 'magic': 12554, 'dystopian': 4565, 'space': 9882,
            'monsters': 12630, 'survival': 10683, 'supernatural': 9840
          }
          if (themeKeywordMap[selectedTheme.value]) allKeywords.push(themeKeywordMap[selectedTheme.value])
        }

        if (selectedKeywords.value.length > 0) {
          const keywordMap = {
            'indie': 11412, 'underrated': 209714, 'cult': 34012,
            'dark': 10714, 'gritty': 8399, 'quirky': 263107
          }
          const keywordIds = selectedKeywords.value.map(k => keywordMap[k]).filter(Boolean)
          allKeywords = allKeywords.concat(keywordIds)
        }
        
        if (allKeywords.length > 0) {
          if (params.with_keywords) {
            params.with_keywords = `${params.with_keywords}|${allKeywords.join('|')}`
          } else {
            params.with_keywords = allKeywords.join('|')
          }
        }

        params.include_adult = false
        return await tmdbService.discoverTV(params)
      } else {
        switch (selectedCategory.value) {
          case 'popular': return await tmdbService.getPopularTV(page)
          case 'top_rated': return await tmdbService.getTopRatedTV(page)
          case 'on_the_air': return await tmdbService.getOnTheAirTV(page)
          case 'airing_today': return await tmdbService.getAiringTodayTV(page)
          case 'underground': return await tmdbService.discoverTV({ sort_by: 'vote_average.desc', vote_count_gte: 20, vote_count_lte: 300, page })
          case 'hidden_gems': return await tmdbService.discoverTV({ sort_by: 'vote_average.desc', vote_count_gte: 50, vote_count_lte: 500, vote_average_gte: 7, page })
          default: return await tmdbService.getPopularTV(page)
        }
      }
    }

    async function loadTVShows() {
      loading.value = true
      error.value = null
      currentPage.value = 1
      tvShows.value = []

      try {
        const response = await fetchTVShows(currentPage.value)
        tvShows.value = response.results || []
        totalPages.value = response.total_pages || 0
      } catch (err) {
        error.value = err.message || 'Failed to load TV shows'
        console.error('Failed to load TV shows:', err)
      } finally {
        loading.value = false
      }
    }

    async function loadMoreShows() {
      if (!hasMoreTVShows.value || loadingMore.value) return

      const now = Date.now()
      if (now - lastLoadTime.value < minLoadInterval) return
      lastLoadTime.value = now

      loadingMore.value = true
      currentPage.value += 1

      try {
        const response = await fetchTVShows(currentPage.value)
        tvShows.value.push(...(response.results || []))
        totalPages.value = response.total_pages || totalPages.value
      } catch (err) {
        console.error('Failed to load more TV shows:', err)
      } finally {
        loadingMore.value = false
      }
    }

    async function loadGenres() {
      try {
        const response = await tmdbService.getTVGenres()
        tvGenres.value = response.genres || []
      } catch (err) {
        console.error('Failed to load genres:', err)
      }
    }

    // Add watchers for all filter values to trigger loadTVShows
    const filtersToWatch = [
      selectedCategory,
      selectedGenre,
      selectedYear,
      selectedNetwork,
      sortBy,
      selectedAudience,
      selectedTheme
    ]

    // Watch all filter values except keywords
    filtersToWatch.forEach(filter => {
      watch(filter, () => {
        console.log('Filter changed, reloading TV shows')
        loadTVShows()
      })
    })

    // Special handling for keywords with debounce
    watch(selectedKeywords, () => {
      if (autoApplyTimer.value) clearTimeout(autoApplyTimer.value)
      autoApplyTimer.value = setTimeout(() => {
        loadTVShows()
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

    // LazyGrid handles scrolling automatically, so we don't need these scroll handlers
    onMounted(() => {
      loadGenres()
      loadTVShows()
    })

    return {
      tvShows,
      tvGenres,
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
      hasMoreTVShows,
      infiniteScrollEnabled,
      loadTVShows,
      loadMoreShows,
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

.header-section {
  text-align: center;
  padding: 40px 0;
  margin-bottom: 2rem;
  border-bottom: 1px solid var(--border-color);
}

.page-title {
  font-size: 3rem;
  font-weight: 800;
  letter-spacing: -0.04em;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  text-transform: lowercase;
}

.page-subtitle {
  font-size: 1.1rem;
  color: var(--text-secondary);
  font-weight: 400;
}

.page-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 5vw;
}

.filter-dashboard {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  padding: 24px;
  margin-bottom: 40px;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-label {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-secondary);
  font-weight: 600;
}

.select-wrapper {
  position: relative;
  width: 100%;
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

.select-wrapper select:focus {
  border-color: var(--text-primary);
}

.select-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  pointer-events: none;
  color: var(--text-secondary);
}

.select-wrapper select:focus + .select-icon {
  color: var(--text-primary);
}

.keyword-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding-top: 24px;
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
  border-color: var(--text-secondary);
}

.chip-btn.active {
  background: var(--text-primary);
  color: var(--bg-primary);
  border-color: var(--text-primary);
}

.tv-section {
  min-height: 50vh;
}

.loader-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  gap: 16px;
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
  padding: 40px 0;
  color: var(--text-secondary);
}

.end-mark {
  width: 4px;
  height: 4px;
  background: var(--text-secondary);
  margin: 0 auto 16px;
  border-radius: 50%;
}

.state-overlay {
  min-height: 50vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.state-overlay h2 {
  font-size: 1.5rem;
  margin-bottom: 8px;
  color: var(--text-primary);
}

.state-overlay p {
  color: var(--text-secondary);
  margin-bottom: 24px;
}

.retry-btn {
  background: transparent;
  border: 1px solid var(--text-primary);
  color: var(--text-primary);
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
  .page-layout {
    padding-top: 80px;
  }

  .header-section {
    padding: 24px 0;
  }

  .page-title {
    font-size: 2.5rem;
  }

  .filter-dashboard {
    padding: 16px;
  }

  .filter-grid {
    grid-template-columns: 1fr;
  }
}
</style>
