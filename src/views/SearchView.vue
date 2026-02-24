<template>
  <div class="search-view page-layout">
    <div class="header-section">
      <div class="header-content">
        <h1 class="page-title">Search</h1>
        <p class="page-subtitle">Find your favorite movies and TV shows.</p>
      </div>
    </div>

    <div class="page-container">
      <!-- Search Input -->
      <div class="search-input-section">
        <div class="search-input-wrapper">
          <input
            v-model="searchQuery"
            type="text"
            class="search-input"
            placeholder="Search movies, TV shows, and people..."
            @keyup.enter="performSearch"
            @input="onSearchInput"
            autofocus
          />
          <button v-if="searchQuery" class="clear-btn" @click="clearSearch">
            <svg viewBox="0 0 24 24"><path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
          </button>
        </div>

        <div class="search-filters">
          <div class="toggle-group">
            <button :class="['toggle-btn', { active: searchType === 'multi' }]" @click="searchType = 'multi'">All</button>
            <button :class="['toggle-btn', { active: searchType === 'movie' }]" @click="searchType = 'movie'">Movies</button>
            <button :class="['toggle-btn', { active: searchType === 'tv' }]" @click="searchType = 'tv'">TV Shows</button>
            <button :class="['toggle-btn', { active: searchType === 'person' }]" @click="searchType = 'person'">People</button>
          </div>
        </div>
      </div>

      <!-- Search Results -->
      <div v-if="searchResults.length > 0" class="search-results">
        <h2 class="results-title">
          Search Results for "{{ lastSearchQuery }}"
          <span class="results-count">({{ totalResults }} results)</span>
        </h2>

        <LazyGrid
          :items="searchResults"
          :loading="loadingMore"
          :has-more-content="hasMoreResults"
          grid-class="media-grid media-grid--large"
          @load-more="loadMoreResults"
        >
          <template #item="{ item }">
            <div class="card-wrap">
              <MediaCard
                v-if="item.media_type !== 'person'"
                :item="item"
                :media-type="item.media_type || searchType"
              />

              <!-- Person Card -->
              <div
                v-else
                class="person-card"
                @click="goToPerson(item.id)"
              >
                <div class="person-image-wrapper">
                  <img
                    v-if="item.profile_path"
                    :src="getProfileUrl(item.profile_path)"
                    :alt="item.name"
                    class="person-image"
                  />
                  <div v-else class="person-placeholder">
                    <svg viewBox="0 0 24 24" class="person-icon"><path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                  </div>
                </div>

                <div class="person-info">
                  <h4 class="person-name">{{ item.name }}</h4>
                  <p class="person-known-for">{{ item.known_for_department }}</p>
                  <div v-if="item.known_for && item.known_for.length > 0" class="known-for-works">
                    <p class="known-for-title">Known for:</p>
                    <p class="known-for-list">
                      {{ item.known_for.slice(0, 2).map(work => work.title || work.name).join(', ') }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <template #loading>
            <div class="loader-box">
              <div class="loader-circle"></div>
              <p>Fetching results...</p>
            </div>
          </template>

          <template #empty>
            <div class="loader-box">
              <p>No results found for that search.</p>
            </div>
          </template>

          <template #footer>
            <div v-if="!hasMoreResults && searchResults.length > 0" class="end-of-results">
              <div class="end-mark"></div>
              <p>You've reached the end of the results</p>
            </div>
          </template>
        </LazyGrid>
      </div>

      <!-- No Results -->
      <div v-else-if="searched && !loading" class="no-results">
        <h2>No results found</h2>
        <p>Try searching with different keywords or check your spelling.</p>
      </div>

      <!-- Popular Content (when no search) -->
      <div v-else-if="!searched" class="popular-content">
        <h2 class="section-title">Popular This Week</h2>
        <div class="media-grid media-grid--large">
          <MediaCard
            v-for="item in popularContent"
            :key="item.id"
            :item="item"
            :media-type="item.media_type || 'movie'"
          />
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="state-overlay">
        <div class="loader-circle"></div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MediaCard from '@/components/common/MediaCard.vue'
import LazyGrid from '@/components/common/LazyGrid.vue'
import { tmdbService, imageService } from '@/services/tmdb'

export default {
  name: 'SearchView',
  components: {
    MediaCard,
    LazyGrid
  },
  setup() {
    const route = useRoute()
    const router = useRouter()

    const searchQuery = ref('')
    const searchType = ref('multi')
    const searchResults = ref([])
    const popularContent = ref([])
    const loading = ref(false)
    const loadingMore = ref(false)
    const searched = ref(false)
    const lastSearchQuery = ref('')
    const currentPage = ref(1)
    const totalPages = ref(0)
    const totalResults = ref(0)
    const infiniteScrollEnabled = ref(true)
    const scrollThreshold = ref(800)
    const lastLoadTime = ref(0)
    const minLoadInterval = 1000 // Minimum 1 second between loads

    const hasMoreResults = computed(() => {
      return currentPage.value < totalPages.value
    })

    async function performSearch() {
      if (!searchQuery.value.trim()) return

      loading.value = true
      searched.value = true
      lastSearchQuery.value = searchQuery.value
      currentPage.value = 1

      try {
        let response
        switch (searchType.value) {
          case 'movie':
            response = await tmdbService.searchMovies(searchQuery.value)
            break
          case 'tv':
            response = await tmdbService.searchTV(searchQuery.value)
            break
          case 'person':
            response = await tmdbService.searchPeople(searchQuery.value)
            break
          default:
            response = await tmdbService.searchMulti(searchQuery.value)
        }

        searchResults.value = response.results || []
        totalPages.value = response.total_pages || 0
        totalResults.value = response.total_results || 0

        // Update URL
        router.push({
          query: {
            q: searchQuery.value,
            type: searchType.value
          }
        })
      } catch (error) {
        // search failed
      } finally {
        loading.value = false
      }
    }

    async function loadMoreResults() {
      if (loadingMore.value || !hasMoreResults.value) return
      loadingMore.value = true
      currentPage.value++
      try {
        let response
        switch (searchType.value) {
          case 'movie': response = await tmdbService.searchMovies(searchQuery.value, currentPage.value); break
          case 'tv': response = await tmdbService.searchTV(searchQuery.value, currentPage.value); break
          case 'person': response = await tmdbService.searchPeople(searchQuery.value, currentPage.value); break
          default: response = await tmdbService.searchMulti(searchQuery.value, currentPage.value)
        }
        searchResults.value = [...searchResults.value, ...(response.results || [])]
      } catch (err) {
        console.error('Failed to load more results:', err)
      } finally {
        loadingMore.value = false
      }
    }

    function onSearchInput() {
      // Basic debounce handling if really needed
    }

    function clearSearch() {
      searchQuery.value = ''
      searchResults.value = []
      searched.value = false
      router.push({ query: {} })
    }

    function goToPerson(id) {
      router.push(`/person/${id}`)
    }

    function getProfileUrl(path) {
      return imageService.getProfileUrl(path, 'w185')
    }

    async function loadPopular() {
      try {
        const response = await tmdbService.getTrending('all', 'week')
        popularContent.value = response.results?.slice(0, 10) || []
      } catch (e) { }
    }

    onMounted(() => {
      const q = route.query.q
      const type = route.query.type

      if (q) {
        searchQuery.value = q
        if (type) searchType.value = type
        performSearch()
      } else {
        loadPopular()
      }
    })

    watch(searchType, () => {
      if (searchQuery.value) {
        performSearch()
      }
    })

    return {
      searchQuery,
      searchType,
      searchResults,
      popularContent,
      loading,
      loadingMore,
      searched,
      lastSearchQuery,
      hasMoreResults,
      totalResults,
      performSearch,
      loadMoreResults,
      onSearchInput,
      clearSearch,
      goToPerson,
      getProfileUrl
    }
  }
}
</script>

<style scoped>
.page-layout {
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

.search-input-section {
  max-width: 800px;
  margin: 0 auto 60px auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.search-input-wrapper {
  position: relative;
  width: 100%;
}

.search-input {
  width: 100%;
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  padding: 16px 48px 16px 24px;
  font-size: 1.2rem;
  font-weight: 500;
  outline: none;
  transition: border-color var(--transition-fast);
}

.search-input:focus {
  border-color: var(--text-primary);
}

.search-input::placeholder {
  color: var(--text-secondary);
  opacity: 0.5;
}

.clear-btn {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: var(--text-secondary);
  width: 24px;
  height: 24px;
  cursor: pointer;
  padding: 0;
  transition: color var(--transition-fast);
}

.clear-btn:hover {
  color: var(--text-primary);
}

.search-filters {
  display: flex;
  justify-content: center;
}

.toggle-group {
  display: flex;
  background: transparent;
  padding: 4px;
  border: 1px solid var(--border-color);
  gap: 4px;
  overflow-x: auto;
  max-width: 100%;
}

.toggle-group::-webkit-scrollbar {
  display: none;
}

.toggle-btn {
  background: transparent;
  color: var(--text-secondary);
  border: none;
  padding: 8px 24px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all var(--transition-fast);
}

.toggle-btn:hover {
  color: var(--text-primary);
}

.toggle-btn.active {
  background: var(--text-primary);
  color: var(--bg-primary);
}

.search-results {
  margin-bottom: 40px;
}

.results-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 32px;
  letter-spacing: -0.02em;
}

.results-count {
  font-size: 1rem;
  color: var(--text-secondary);
  font-weight: 400;
  margin-left: 8px;
}

/* Person Card Minimalist */
.person-card {
  background: transparent;
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: border-color var(--transition-fast);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.person-card:hover {
  border-color: var(--text-primary);
}

.person-image-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 2/3;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  overflow: hidden;
}

.person-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.person-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--border-color);
}

.person-icon {
  width: 48px;
  height: 48px;
}

.person-info {
  padding: 16px;
  flex: 1;
}

.person-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px 0;
  letter-spacing: -0.01em;
}

.person-known-for {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin: 0 0 12px 0;
}

.known-for-works {
  margin-top: auto;
}

.known-for-title {
  font-size: 0.75rem;
  color: var(--text-primary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 4px 0;
}

.known-for-list {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.4;
}

.no-results {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  margin: 40px 0;
}

.no-results h2 {
  margin: 0 0 8px 0;
  font-weight: 600;
  font-size: 1.5rem;
  letter-spacing: -0.02em;
}

.no-results p {
  color: var(--text-secondary);
  margin: 0;
}

.popular-content {
  margin-top: 40px;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 24px;
  text-transform: lowercase;
  letter-spacing: -0.02em;
}

.state-overlay, .loader-box {
  min-height: 50vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
}

.loader-box {
  min-height: 200px;
  gap: 16px;
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
}
</style>
