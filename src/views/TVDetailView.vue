<template>
  <div class="tv-detail-view">
    <div v-if="tvShow" class="tv-content">
      <!-- Hero Section -->
      <div class="hero-section">
        <div class="hero-backdrop">
          <img
            v-if="tvShow.backdrop_path"
            :src="getBackdropUrl(tvShow.backdrop_path)"
            :alt="tvShow.name"
            class="hero-image"
          />
        </div>

        <div class="hero-content">
          <div class="page-container hero-grid">
            <div class="poster-column">
              <div class="poster-card">
                <img
                  :src="getPosterUrl(tvShow.poster_path)"
                  :alt="tvShow.name"
                  class="poster-image"
                />
              </div>
            </div>

            <div class="info-column">
              <div class="tv-info">
                <h1 class="tv-title">{{ tvShow.name }}</h1>
                <p v-if="tvShow.tagline" class="tv-tagline">{{ tvShow.tagline }}</p>

                <div class="tv-meta">
                  <span
                    v-if="tvShow.vote_average"
                    class="meta-chip rating-chip"
                    :style="{ color: getRatingColor(tvShow.vote_average) }"
                  >
                    <svg viewBox="0 0 24 24" class="icon" width="16" height="16"><path fill="currentColor" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                    {{ formatRating(tvShow.vote_average) }}
                  </span>

                  <span v-if="tvShow.first_air_date" class="meta-item">
                    {{ getYear(tvShow.first_air_date) }}
                  </span>

                  <span v-if="tvShow.number_of_seasons" class="meta-item">
                    {{ tvShow.number_of_seasons }} Season{{ tvShow.number_of_seasons > 1 ? 's' : '' }}
                  </span>

                  <span v-if="tvShow.number_of_episodes" class="meta-item">
                    {{ tvShow.number_of_episodes }} Episodes
                  </span>

                  <span
                    v-for="genre in tvShow.genres.slice(0, 3)"
                    :key="genre.id"
                    class="genre-chip"
                  >
                    {{ genre.name }}
                  </span>
                </div>

                <p v-if="tvShow.overview" class="tv-overview">
                  {{ tvShow.overview }}
                </p>

                <div class="tv-actions">
                  <button @click="watchTVShow" class="btn-primary">
                    <svg viewBox="0 0 24 24" class="icon"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
                    Watch Now
                  </button>

                  <button @click="toggleFavorite" class="btn-secondary">
                    <svg viewBox="0 0 24 24" class="icon"><path fill="currentColor" :d="isFavorite ? 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z' : 'M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z'"/></svg>
                    {{ isFavorite ? 'Remove from Favorites' : 'Add to Favorites' }}
                  </button>

                  <button @click="toggleWatchlist" class="btn-secondary">
                    <svg viewBox="0 0 24 24" class="icon"><path fill="currentColor" :d="isInWatchlist ? 'M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z' : 'M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13z'"/></svg>
                    {{ isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Video Player Section -->
      <div v-if="showPlayer" class="page-container player-container">
        <VideoPlayer
          :tmdb-id="tvShow.id"
          media-type="tv"
          :title="tvShow.name"
          :backdrop-path="tvShow.backdrop_path"
          :season="selectedSeason"
          :episode="selectedEpisode"
          :total-episodes="currentSeasonEpisodeCount"
          :total-seasons="totalSeasonsCount"
          :next-episode-name="nextEpisodeName"
          :auto-play="false"
          @player-closed="showPlayer = false"
          @episode-changed="handleEpisodeChange"
          @next-episode="handleNextEpisode"
        />
      </div>

      <!-- Seasons & Episodes -->
      <div v-if="tvShow.seasons?.length" class="page-container seasons-container">
        <div class="section-card full-width">
          <h2 class="section-title">Seasons & Episodes</h2>

          <div class="season-selector-wrapper">
            <select v-model="selectedSeason" @change="loadSeasonDetails" class="custom-select">
              <option v-for="option in seasonOptions" :key="option.value" :value="option.value">
                {{ option.title }}
              </option>
            </select>
          </div>

          <div v-if="currentSeasonDetails" class="season-details">
            <h3 class="season-title">{{ currentSeasonDetails.name }}</h3>
            <p v-if="currentSeasonDetails.overview" class="season-overview">
              {{ currentSeasonDetails.overview }}
            </p>

            <div v-if="currentSeasonDetails.episodes" class="episodes-grid">
              <div
                v-for="episode in currentSeasonDetails.episodes"
                :key="episode.id"
                class="episode-card"
                @click="watchEpisode(selectedSeason, episode.episode_number)"
              >
                <div class="episode-image-wrapper">
                  <img
                    v-if="episode.still_path"
                    :src="getStillUrl(episode.still_path)"
                    :alt="episode.name"
                    class="episode-image"
                  />
                  <div v-else class="episode-image-placeholder"></div>
                  <div class="episode-overlay">
                    <div class="play-icon-circle">
                      <svg viewBox="0 0 24 24" class="icon play-icon"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
                    </div>
                  </div>
                </div>

                <div class="episode-card-content">
                  <div class="episode-number">Episode {{ episode.episode_number }}</div>
                  <h4 class="episode-title">{{ episode.name }}</h4>
                  <p class="episode-overview">{{ truncateText(episode.overview, 80) }}</p>
                  <div class="episode-meta">
                    <span v-if="episode.air_date">{{ formatDate(episode.air_date) }}</span>
                    <span v-if="episode.runtime">{{ episode.runtime }}m</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Details Section -->
      <div class="page-container details-container">
        <div class="details-grid">
          <div class="main-column">
            <!-- Cast & Crew -->
            <div v-if="tvShow.credits" class="section-card">
              <h2 class="section-title">Cast & Crew</h2>

              <div v-if="creators.length" class="crew-section">
                <h3 class="crew-title">Creators</h3>
                <div class="crew-list">
                  <span v-for="(creator, index) in creators" :key="creator.id">
                    {{ creator.name }}<span v-if="index < creators.length - 1">, </span>
                  </span>
                </div>
              </div>

              <div v-if="cast.length" class="cast-section">
                <h3 class="crew-title">Cast</h3>
                <div class="cast-grid">
                  <div
                    v-for="person in cast"
                    :key="person.id"
                    class="cast-card"
                    @click="goToPerson(person.id)"
                  >
                    <img
                      :src="getProfileUrl(person.profile_path)"
                      :alt="person.name"
                      class="cast-image"
                    />
                    <div class="cast-info">
                      <p class="cast-name">{{ person.name }}</p>
                      <p class="cast-character">{{ person.character }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Similar TV Shows -->
            <div v-if="similar.length" class="section-card similar-movies-section">
              <h2 class="section-title">Similar TV Shows</h2>
              <div class="media-grid media-grid--large">
                <div v-for="similarShow in similar" :key="similarShow.id" class="card-wrap">
                  <MediaCard
                    :item="similarShow"
                    media-type="tv"
                    @click="goToTV(similarShow.id)"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="sidebar-column">
            <!-- TV Show Info Sidebar -->
            <div class="section-card info-sidebar">
              <h2 class="section-title">Show Info</h2>

              <div class="info-item">
                <strong>First Air Date:</strong>
                <span>{{ formatDate(tvShow.first_air_date) }}</span>
              </div>

              <div v-if="tvShow.last_air_date" class="info-item">
                <strong>Last Air Date:</strong>
                <span>{{ formatDate(tvShow.last_air_date) }}</span>
              </div>

              <div v-if="tvShow.status" class="info-item">
                <strong>Status:</strong>
                <span>{{ tvShow.status }}</span>
              </div>

              <div v-if="tvShow.networks?.length" class="info-item">
                <strong>Networks:</strong>
                <div class="networks">
                  <span v-for="(network, index) in tvShow.networks" :key="network.id">
                    {{ network.name }}<span v-if="index < tvShow.networks.length - 1">, </span>
                  </span>
                </div>
              </div>

              <div v-if="tvShow.production_companies?.length" class="info-item">
                <strong>Studios:</strong>
                <div class="production-companies">
                  <span v-for="(company, index) in tvShow.production_companies.slice(0, 3)" :key="company.id">
                    {{ company.name }}<span v-if="index < Math.min(tvShow.production_companies.length, 3) - 1">, </span>
                  </span>
                </div>
              </div>

              <div v-if="tvShow.spoken_languages?.length" class="info-item">
                <strong>Languages:</strong>
                <div class="languages">
                  <span v-for="(lang, index) in tvShow.spoken_languages" :key="lang.iso_639_1">
                    {{ lang.english_name }}<span v-if="index < tvShow.spoken_languages.length - 1">, </span>
                  </span>
                </div>
              </div>
            </div>

            <!-- Trailer -->
            <div v-if="trailerKey" class="section-card">
              <h2 class="section-title">Trailer</h2>
              <div class="trailer-container">
                <iframe
                  :src="`https://www.youtube.com/embed/${trailerKey}`"
                  frameborder="0"
                  allowfullscreen
                  class="trailer-iframe"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else-if="loading" class="state-overlay">
      <div class="loader-circle"></div>
      <p>Loading TV show details...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="state-overlay error">
      <h2>Failed to load TV show</h2>
      <p>{{ error }}</p>
      <button @click="loadTVShow" class="btn-primary">Try Again</button>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import VideoPlayer from '@/components/common/VideoPlayer.vue'
import MediaCard from '@/components/common/MediaCard.vue'
import { tmdbService, imageService, utilsService } from '@/services/tmdb'
import { localStorageService } from '@/services/localStorage'

export default {
  name: 'TVDetailView',
  components: {
    VideoPlayer,
    MediaCard
  },
  setup() {
    const route = useRoute()
    const router = useRouter()

    const tvShow = ref(null)
    const currentSeasonDetails = ref(null)
    const loading = ref(true)
    const error = ref(null)
    const showPlayer = ref(false)
    const selectedSeason = ref(1)
    const selectedEpisode = ref(1)
    const isFavorite = ref(false)
    const isInWatchlist = ref(false)

    const creators = computed(() => tvShow.value?.created_by || [])
    const cast = computed(() => utilsService.getMainCast(tvShow.value?.credits, 12) || [])
    const similar = computed(() => tvShow.value?.similar?.results?.slice(0, 12) || [])
    const trailerKey = computed(() => utilsService.getTrailerKey(tvShow.value?.videos))

    const seasonOptions = computed(() => {
      if (!tvShow.value?.seasons) return []
      return tvShow.value.seasons
        .filter(season => season.season_number > 0)
        .map(season => ({
          title: `Season ${season.season_number}`,
          value: season.season_number
        }))
    })

    const currentSeasonEpisodeCount = computed(() => {
      return currentSeasonDetails.value?.episodes?.length || null
    })

    const totalSeasonsCount = computed(() => {
      if (!tvShow.value?.seasons) return null
      return tvShow.value.seasons.filter(s => s.season_number > 0).length
    })

    const nextEpisodeName = computed(() => {
      if (!currentSeasonDetails.value?.episodes) return null
      const next = currentSeasonDetails.value.episodes.find(
        ep => ep.episode_number === selectedEpisode.value + 1
      )
      return next?.name || null
    })

    async function loadTVShow() {
      loading.value = true
      error.value = null
      try {
        const tvId = route.params.id
        const response = await tmdbService.getTVDetails(tvId)
        tvShow.value = response
        if (tvShow.value.seasons?.length) {
          selectedSeason.value = tvShow.value.seasons.find(s => s.season_number > 0)?.season_number || 1
          await loadSeasonDetails()
        }
        checkFavoriteStatus()
        checkWatchlistStatus()
      } catch (err) {
        error.value = err.message || 'Failed to load TV show details'
      } finally {
        loading.value = false
      }
    }

    async function loadSeasonDetails() {
      if (!tvShow.value || !selectedSeason.value) return
      try {
        const response = await tmdbService.getSeasonDetails(tvShow.value.id, selectedSeason.value)
        currentSeasonDetails.value = response
      } catch (err) {
        // season details unavailable
      }
    }

    function watchTVShow() {
      showPlayer.value = true
      selectedEpisode.value = 1
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    function watchEpisode(season, episode) {
      selectedSeason.value = season
      selectedEpisode.value = episode
      showPlayer.value = true
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    function handleEpisodeChange({ season, episode }) {
      selectedSeason.value = season
      selectedEpisode.value = episode
    }

    function handleNextEpisode({ season, episode }) {
      selectedSeason.value = season
      selectedEpisode.value = episode
      if (season !== selectedSeason.value) {
        loadSeasonDetails()
      }
    }

    function toggleFavorite() {
      if (!tvShow.value) return
      const item = { ...tvShow.value, media_type: 'tv' }
      localStorageService.toggleFavorite(item)
      isFavorite.value = localStorageService.isFavorite(tvShow.value.id, 'tv')
    }

    function toggleWatchlist() {
      if (!tvShow.value) return
      const item = { ...tvShow.value, media_type: 'tv' }
      localStorageService.toggleWatchlist(item)
      isInWatchlist.value = localStorageService.isInWatchlist(tvShow.value.id, 'tv')
    }

    function checkFavoriteStatus() {
      if (!tvShow.value) return
      isFavorite.value = localStorageService.isFavorite(tvShow.value.id, 'tv')
    }

    function checkWatchlistStatus() {
      if (!tvShow.value) return
      isInWatchlist.value = localStorageService.isInWatchlist(tvShow.value.id, 'tv')
    }

    function goToTV(tvId) {
      router.push(`/tv/${tvId}`)
    }

    function goToPerson(personId) {
      router.push(`/person/${personId}`)
    }

    function getPosterUrl(path) {
      return imageService.getPosterUrl(path, 'w500')
    }

    function getBackdropUrl(path) {
      return imageService.getBackdropUrl(path, 'w1280')
    }

    function getProfileUrl(path) {
      return imageService.getProfileUrl(path, 'w185')
    }

    function getStillUrl(path) {
      return imageService.getStillUrl(path, 'w300')
    }

    function formatRating(rating) {
      return utilsService.formatVoteAverage(rating)
    }

    function getRatingColor(rating) {
      return utilsService.getRatingColor(rating)
    }

    function formatDate(date) {
      return utilsService.formatDate(date)
    }

    function getYear(date) {
      return utilsService.getYear(date)
    }

    function truncateText(text, maxLength) {
      return utilsService.truncateText(text, maxLength)
    }

    watch(() => route.params.id, (newId) => {
      if (newId) loadTVShow()
    })

    watch(selectedSeason, () => {
      loadSeasonDetails()
    })

    onMounted(() => {
      loadTVShow()
    })

    return {
      tvShow, currentSeasonDetails, loading, error, showPlayer,
      selectedSeason, selectedEpisode, isFavorite, isInWatchlist,
      creators, cast, similar, trailerKey, seasonOptions,
      currentSeasonEpisodeCount, totalSeasonsCount, nextEpisodeName,
      loadTVShow, loadSeasonDetails, watchTVShow, watchEpisode,
      handleEpisodeChange, handleNextEpisode,
      toggleFavorite, toggleWatchlist,
      goToTV, goToPerson,
      getPosterUrl, getBackdropUrl, getProfileUrl, getStillUrl,
      formatRating, getRatingColor, formatDate, getYear, truncateText,
    }
  }
}
</script>

<style scoped>
.tv-detail-view {
  min-height: 100vh;
  position: relative;
}

.page-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 clamp(1.5rem, 5vw, 4rem);
}

.player-container {
  padding-bottom: 2rem;
}

.hero-section {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: flex-end;
  padding-bottom: 4rem;
}

.hero-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.hero-backdrop::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, var(--bg-primary) 0%, transparent 100%),
              linear-gradient(to right, var(--bg-primary) 0%, transparent 100%);
}

.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.6;
}

.hero-content {
  position: relative;
  z-index: 10;
  width: 100%;
}

.hero-grid {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 4rem;
  align-items: end;
}

.poster-card {
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  aspect-ratio: 2/3;
  width: 100%;
}

.poster-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tv-title {
  font-size: clamp(2.5rem, 5vw, 4.5rem);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.02em;
  margin-bottom: 0.5rem;
}

.tv-tagline {
  font-size: 1.5rem;
  color: var(--text-secondary);
  font-weight: 300;
  margin-bottom: 1.5rem;
}

.tv-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  font-size: 0.95rem;
}

.meta-item {
  color: var(--text-secondary);
}

.meta-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-weight: 600;
}

.genre-chip {
  padding: 0.25rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 100px;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.tv-overview {
  font-size: 1.1rem;
  line-height: 1.6;
  color: var(--text-secondary);
  max-width: 800px;
  margin-bottom: 2rem;
}

.tv-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

/* Common Section Styles */
.details-container {
  padding-top: 4rem;
  padding-bottom: 6rem;
}

.details-grid {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 4rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  letter-spacing: -0.02em;
}

.section-card {
  margin-bottom: 3rem;
}

.full-width {
  margin-top: 3rem;
}

/* Cast and Crew */
.crew-title {
  font-size: 1rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.crew-list {
  font-size: 1.1rem;
  margin-bottom: 2rem;
}

.cast-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.cast-card {
  cursor: pointer;
}

.cast-image {
  width: 100%;
  aspect-ratio: 2/3;
  object-fit: cover;
  border-radius: var(--border-radius-sm);
  background: var(--bg-secondary);
  transition: transform var(--transition-fast);
  margin-bottom: 0.75rem;
}

.cast-card:hover .cast-image {
  transform: translateY(-4px);
}

.cast-name {
  font-weight: 500;
  font-size: 0.95rem;
  line-height: 1.2;
  margin-bottom: 0.25rem;
}

.cast-character {
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.2;
}

/* Seasons & Episodes */
.season-selector-wrapper {
  margin-bottom: 2rem;
}

.custom-select {
  background: transparent;
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  padding: 0.75rem 1rem;
  border-radius: var(--border-radius-sm);
  font-size: 1rem;
  outline: none;
  width: 100%;
  max-width: 300px;
  cursor: pointer;
  appearance: none;
  background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E');
  background-repeat: no-repeat;
  background-position: right 1rem top 50%;
  background-size: 0.65rem auto;
}

.custom-select option {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.season-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.season-overview {
  color: var(--text-secondary);
  margin-bottom: 2rem;
  max-width: 800px;
  line-height: 1.6;
}

.episodes-grid {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.episode-card {
  display: flex;
  gap: 1.5rem;
  background: transparent;
  border-top: 1px solid var(--border-color);
  padding-top: 1.5rem;
  cursor: pointer;
  transition: opacity var(--transition-fast);
}

.episode-card:hover {
  opacity: 0.8;
}

.episode-image-wrapper {
  position: relative;
  width: 240px;
  flex-shrink: 0;
  aspect-ratio: 16/9;
  border-radius: var(--border-radius-sm);
  overflow: hidden;
  background: var(--bg-secondary);
}

@media (max-width: 768px) {
  .episode-card {
    flex-direction: column;
  }
  .episode-image-wrapper {
    width: 100%;
  }
}

.episode-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.episode-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.episode-card:hover .episode-overlay {
  opacity: 1;
}

.play-icon-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--text-primary);
  color: var(--bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  transform: scale(0.9);
  transition: transform var(--transition-fast);
}

.episode-card:hover .play-icon-circle {
  transform: scale(1);
}

.episode-card-content {
  flex-grow: 1;
}

.episode-number {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
}

.episode-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.episode-overview {
  font-size: 0.95rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 1rem;
}

.episode-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

/* Sidebar Info */
.info-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-item strong {
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-primary);
}

.info-item span, .networks, .production-companies, .languages {
  color: var(--text-secondary);
}

/* Trailer */
.trailer-container {
  position: relative;
  width: 100%;
  padding-top: 56.25%;
  border-radius: var(--border-radius-sm);
  overflow: hidden;
  background: var(--bg-secondary);
}

.trailer-iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 0;
}

/* Icons */
.icon {
  width: 20px;
  height: 20px;
  display: inline-block;
  vertical-align: middle;
}
.play-icon {
  width: 24px;
  height: 24px;
}

/* State Overlays */
.state-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
  z-index: 100;
  gap: 1.5rem;
}

.loader-circle {
  width: 48px;
  height: 48px;
  border: 3px solid var(--border-color);
  border-top-color: var(--text-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 1024px) {
  .details-grid {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
}

@media (max-width: 768px) {
  .hero-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .poster-card {
    max-width: 240px;
    margin: 0 auto;
  }

  .tv-info {
    text-align: center;
  }

  .tv-meta, .tv-actions {
    justify-content: center;
  }

  .tv-overview {
    text-align: left;
  }
}
</style>
