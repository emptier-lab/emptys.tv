<template>
  <div class="watch-view page-layout">
    <div v-if="media" class="watch-content">
      <!-- Back Navigation -->
      <div class="navigation-bar page-container">
        <button @click="goBack" class="back-btn">
          <svg viewBox="0 0 24 24" class="icon"><path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
          Back
        </button>
      </div>

      <!-- Media Header -->
      <div class="media-header page-container">
        <div class="header-content">
          <div class="title-container">
            <h1 class="media-title">{{ mediaTitle }}</h1>
            <p v-if="mediaSubtitle" class="media-subtitle">{{ mediaSubtitle }}</p>
          </div>
          <div class="actions-container">
            <button @click="toggleFavorite" class="btn-secondary">
              <svg viewBox="0 0 24 24" class="icon"><path fill="currentColor" :d="isFavorite ? 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z' : 'M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z'"/></svg>
              {{ isFavorite ? 'Favorited' : 'Add to Favorites' }}
            </button>
            <button @click="toggleWatchlist" class="btn-secondary">
              <svg viewBox="0 0 24 24" class="icon"><path fill="currentColor" :d="isInWatchlist ? 'M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z' : 'M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13z'"/></svg>
              {{ isInWatchlist ? 'In Watchlist' : 'Add to Watchlist' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Video Player -->
      <div class="player-container page-container">
        <VideoPlayer
          :tmdb-id="mediaId"
          :media-type="mediaType"
          :title="mediaTitle"
          :backdrop-path="media.backdrop_path"
          :season="currentSeason"
          :episode="currentEpisode"
          :seasons="media.seasons"
          :auto-play="true"
          @episode-changed="handleEpisodeChange"
        />
      </div>

      <!-- Media Information -->
      <div class="media-info-section page-container">
        <div class="info-grid">
          <div class="main-column">
            <div class="section-card">
              <h2 class="section-title">About</h2>
              <p v-if="media.overview" class="media-overview">
                {{ media.overview }}
              </p>

              <div class="media-details">
                <div class="detail-item">
                  <strong>Rating:</strong>
                  <span
                    v-if="media.vote_average"
                    class="meta-chip rating-chip ml-2"
                    :style="{ color: getRatingColor(media.vote_average) }"
                  >
                    <svg viewBox="0 0 24 24" class="icon" width="14" height="14"><path fill="currentColor" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                    {{ formatRating(media.vote_average) }}
                  </span>
                </div>

                <div class="detail-item">
                  <strong>Release:</strong>
                  <span>{{ getReleaseDate() }}</span>
                </div>

                <div v-if="media.genres?.length" class="detail-item">
                  <strong>Genres:</strong>
                  <div class="genres">
                    <span
                      v-for="genre in media.genres"
                      :key="genre.id"
                      class="genre-chip"
                    >
                      {{ genre.name }}
                    </span>
                  </div>
                </div>

                <div v-if="mediaType === 'movie' && media.runtime" class="detail-item">
                  <strong>Runtime:</strong>
                  <span>{{ formatRuntime(media.runtime) }}</span>
                </div>

                <div v-if="mediaType === 'tv'" class="detail-item">
                  <strong>Seasons:</strong>
                  <span>{{ media.number_of_seasons }} season{{ media.number_of_seasons > 1 ? 's' : '' }}</span>
                </div>

                <div v-if="mediaType === 'tv'" class="detail-item">
                  <strong>Episodes:</strong>
                  <span>{{ media.number_of_episodes }} episodes</span>
                </div>
              </div>
            </div>

            <!-- Episode List for TV Shows -->
            <div v-if="mediaType === 'tv' && currentSeasonDetails" class="section-card episodes-card">
              <h2 class="section-title">Episodes - Season {{ currentSeason }}</h2>

              <div class="season-selector-wrapper">
                <select v-model="currentSeason" @change="loadSeasonDetails" class="custom-select">
                  <option v-for="option in seasonOptions" :key="option.value" :value="option.value">
                    {{ option.title }}
                  </option>
                </select>
              </div>

              <div class="episodes-list">
                <div
                  v-for="episode in currentSeasonDetails.episodes"
                  :key="episode.id"
                  :class="{ 'episode-active': episode.episode_number === currentEpisode }"
                  class="episode-item"
                  @click="watchEpisode(currentSeason, episode.episode_number)"
                >
                  <div class="episode-image-wrapper">
                    <img
                      v-if="episode.still_path"
                      :src="getStillUrl(episode.still_path)"
                      :alt="episode.name"
                      class="episode-image"
                    />
                    <div v-else class="episode-placeholder">
                      <svg viewBox="0 0 24 24" class="icon"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
                    </div>
                  </div>
                  
                  <div class="episode-card-content">
                    <div class="episode-number">Episode {{ episode.episode_number }}</div>
                    <h4 class="episode-title">{{ episode.name }}</h4>
                    <p class="episode-overview">{{ truncateText(episode.overview, 120) }}</p>
                    <div class="episode-meta">
                      <span v-if="episode.air_date">{{ formatDate(episode.air_date) }}</span>
                      <span v-if="episode.runtime">{{ episode.runtime }}m</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="sidebar-column">
            <!-- Similar Content -->
            <div v-if="similar.length" class="section-card similar-card">
              <h2 class="section-title">More Like This</h2>
              <div class="similar-grid">
                <div v-for="item in similar" :key="item.id" class="card-wrap">
                  <MediaCard
                    :item="item"
                    :media-type="mediaType"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else-if="loading" class="state-overlay">
      <div class="loader-circle"></div>
      <p class="loading-text">Loading content...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="state-overlay error">
      <h2>Failed to load content</h2>
      <p>{{ error }}</p>
      <button @click="loadMedia" class="btn-primary">
        Try Again
      </button>
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
  name: 'WatchView',
  components: {
    VideoPlayer,
    MediaCard
  },
  setup() {
    const route = useRoute()
    const router = useRouter()

    const media = ref(null)
    const currentSeasonDetails = ref(null)
    const loading = ref(true)
    const error = ref(null)
    const isFavorite = ref(false)
    const isInWatchlist = ref(false)

    const mediaType = computed(() => route.params.type)
    const mediaId = computed(() => route.params.id)
    const currentSeason = ref(parseInt(route.params.season) || 1)
    const currentEpisode = ref(parseInt(route.params.episode) || 1)

    const mediaTitle = computed(() => {
      return media.value?.title || media.value?.name || 'Unknown Title'
    })

    const mediaSubtitle = computed(() => {
      if (mediaType.value === 'tv' && route.params.season && route.params.episode) {
        return `Season ${currentSeason.value}, Episode ${currentEpisode.value}`
      }
      return null
    })

    const seasonOptions = computed(() => {
      if (!media.value?.seasons) return []
      return media.value.seasons
        .filter(season => season.season_number > 0)
        .map(season => ({
          title: `Season ${season.season_number}`,
          value: season.season_number
        }))
    })

    const similar = computed(() => {
      return media.value?.similar?.results?.slice(0, 6) || []
    })

    async function loadMedia() {
      loading.value = true
      error.value = null

      try {
        let response
        if (mediaType.value === 'movie') {
          response = await tmdbService.getMovieDetails(mediaId.value)
        } else {
          response = await tmdbService.getTVDetails(mediaId.value)
          if (response.seasons?.length) {
            await loadSeasonDetails()
          }
        }
        media.value = response

        checkFavoriteStatus()
        checkWatchlistStatus()
      } catch (err) {
        error.value = err.message || 'Failed to load content'
      } finally {
        loading.value = false
      }
    }

    async function loadSeasonDetails() {
      if (!media.value || !currentSeason.value) return

      try {
        const response = await tmdbService.getSeasonDetails(media.value.id, currentSeason.value)
        currentSeasonDetails.value = response
      } catch (err) {
        console.error('Failed to load season details:', err)
      }
    }

    function watchEpisode(season, episode) {
      currentSeason.value = season
      currentEpisode.value = episode

      // Update URL
      const newPath = `/watch/tv/${mediaId.value}/${season}/${episode}`
      router.replace(newPath)
    }

    function handleEpisodeChange(data) {
      watchEpisode(data.season, data.episode)
    }

    function goBack() {
      router.back()
    }

    function toggleFavorite() {
      if (media.value) {
        const mediaItem = {
          ...media.value,
          media_type: mediaType.value
        };
        const result = localStorageService.toggleFavorite(mediaItem);
        isFavorite.value = localStorageService.isFavorite(mediaId.value, mediaType.value);
      }
    }

    function toggleWatchlist() {
      if (media.value) {
        const mediaItem = {
          ...media.value,
          media_type: mediaType.value
        };
        const result = localStorageService.toggleWatchlist(mediaItem);
        isInWatchlist.value = localStorageService.isInWatchlist(mediaId.value, mediaType.value);
      }
    }

    function checkFavoriteStatus() {
      if (mediaId.value && mediaType.value) {
        isFavorite.value = localStorageService.isFavorite(mediaId.value, mediaType.value);
      } else {
        isFavorite.value = false;
      }
    }

    function checkWatchlistStatus() {
      if (mediaId.value && mediaType.value) {
        isInWatchlist.value = localStorageService.isInWatchlist(mediaId.value, mediaType.value);
      } else {
        isInWatchlist.value = false;
      }
    }

    function getReleaseDate() {
      const date = media.value?.release_date || media.value?.first_air_date
      return utilsService.formatDate(date)
    }

    function formatRating(rating) {
      return utilsService.formatVoteAverage(rating)
    }

    function getRatingColor(rating) {
      return utilsService.getRatingColor(rating)
    }

    function formatRuntime(minutes) {
      return utilsService.formatRuntime(minutes)
    }

    function formatDate(date) {
      return utilsService.formatDate(date)
    }

    function truncateText(text, maxLength) {
      return utilsService.truncateText(text, maxLength)
    }

    function getStillUrl(path) {
      return imageService.getStillUrl(path, 'w300')
    }

    watch(() => route.params, () => {
      currentSeason.value = parseInt(route.params.season) || 1
      currentEpisode.value = parseInt(route.params.episode) || 1
      loadMedia()
    })

    // Watch for media loaded to check favorite/watchlist status and update recently watched
    watch(media, (newMedia) => {
      if (newMedia) {
        checkFavoriteStatus()
        checkWatchlistStatus()

        // Add to recently watched when media changes
        if (mediaId.value && mediaType.value) {
          localStorageService.addToRecentlyWatched(
            newMedia,
            mediaType.value === 'tv' ? currentSeason.value : null,
            mediaType.value === 'tv' ? currentEpisode.value : null
          );
        }
      }
    })

    watch(currentSeason, () => {
      if (mediaType.value === 'tv') {
        loadSeasonDetails()
      }
    })

    onMounted(() => {
      loadMedia()

      // Add the media to recently watched when viewing
      if (mediaId.value && mediaType.value && media.value) {
        localStorageService.addToRecentlyWatched(
          media.value,
          mediaType.value === 'tv' ? currentSeason.value : null,
          mediaType.value === 'tv' ? currentEpisode.value : null
        );
      }
    })

    return {
      media,
      currentSeasonDetails,
      loading,
      error,
      mediaType,
      mediaId,
      currentSeason,
      currentEpisode,
      mediaTitle,
      mediaSubtitle,
      seasonOptions,
      similar,
      isFavorite,
      isInWatchlist,
      loadMedia,
      loadSeasonDetails,
      watchEpisode,
      handleEpisodeChange,
      goBack,
      toggleFavorite,
      toggleWatchlist,
      getReleaseDate,
      formatRating,
      getRatingColor,
      formatRuntime,
      formatDate,
      truncateText,
      getStillUrl
    }
  }
}
</script>

<style scoped>
.watch-view {
  min-height: 100vh;
}

.navigation-bar {
  padding-top: 1rem;
  padding-bottom: 1rem;
}

.back-btn {
  background: transparent;
  color: var(--text-secondary);
  border: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  cursor: pointer;
  padding: 0.5rem 0;
  transition: color var(--transition-fast);
}

.back-btn:hover {
  color: var(--text-primary);
}

.media-header {
  padding: 1rem 0 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 2rem;
}

.media-title {
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.1;
  margin-bottom: 0.25rem;
}

.media-subtitle {
  font-size: 1.25rem;
  color: var(--text-secondary);
}

.actions-container {
  display: flex;
  gap: 1rem;
}

.media-info-section {
  padding: 2rem 0;
}

.info-grid {
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
  background: rgba(255, 255, 255, 0.02);
  border-radius: var(--border-radius-xl);
  padding: 2rem;
}

.media-overview {
  font-size: 1.1rem;
  line-height: 1.6;
  color: var(--text-secondary);
  margin-bottom: 2rem;
}

.media-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.95rem;
}

.detail-item strong {
  min-width: 100px;
  color: var(--text-primary);
}

.detail-item span {
  color: var(--text-secondary);
}

.genre-chip {
  padding: 0.25rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 100px;
  font-size: 0.85rem;
  color: var(--text-secondary);
}
.genres {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.rating-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-weight: 600;
}

/* Episodes */
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

.episodes-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.episode-item {
  display: flex;
  gap: 1.5rem;
  background: transparent;
  border-top: 1px solid var(--border-color);
  padding-top: 1.5rem;
  cursor: pointer;
  transition: opacity var(--transition-fast);
}
.episode-item:hover {
  opacity: 0.8;
}

.episode-active {
  border-color: var(--accent-color);
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
.episode-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.episode-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: var(--border-color);
  color: var(--text-secondary);
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

.similar-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 1rem;
}

/* Icons */
.icon {
  width: 20px;
  height: 20px;
  display: inline-block;
  vertical-align: middle;
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
  .info-grid {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
  }
  
  .episode-item {
    flex-direction: column;
  }
  
  .episode-image-wrapper {
    width: 100%;
  }
}
</style>
