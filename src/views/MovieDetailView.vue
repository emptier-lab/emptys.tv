<template>
  <div class="movie-detail-view page-layout">
    <div v-if="movie" class="movie-content">
      <!-- Hero Section -->
      <div class="hero-section">
        <div class="hero-backdrop">
          <img
            v-if="movie.backdrop_path"
            :src="getBackdropUrl(movie.backdrop_path)"
            :alt="movie.title"
            class="hero-image"
          />
        </div>

        <div class="hero-content">
          <div class="page-container hero-grid">
            <div class="poster-column">
              <div class="poster-card">
                <img
                  :src="getPosterUrl(movie.poster_path)"
                  :alt="movie.title"
                  class="poster-image"
                />
              </div>
            </div>

            <div class="info-column">
              <div class="movie-info">
                <h1 class="movie-title">{{ movie.title }}</h1>
                <p v-if="movie.tagline" class="movie-tagline">{{ movie.tagline }}</p>

                <div class="movie-meta">
                  <span
                    v-if="movie.vote_average"
                    class="meta-chip rating-chip"
                    :style="{ color: getRatingColor(movie.vote_average) }"
                  >
                    <svg viewBox="0 0 24 24" class="icon" width="16" height="16"><path fill="currentColor" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                    {{ formatRating(movie.vote_average) }}
                  </span>

                  <span v-if="movie.release_date" class="meta-item">
                    {{ getYear(movie.release_date) }}
                  </span>

                  <span v-if="movie.runtime" class="meta-item">
                    {{ formatRuntime(movie.runtime) }}
                  </span>

                  <span
                    v-for="genre in movie.genres.slice(0, 3)"
                    :key="genre.id"
                    class="genre-chip"
                  >
                    {{ genre.name }}
                  </span>
                </div>

                <p v-if="movie.overview" class="movie-overview">
                  {{ movie.overview }}
                </p>

                <div class="movie-actions">
                  <button @click="watchMovie" class="btn-primary">
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
          :tmdb-id="movie.id"
          media-type="movie"
          :title="movie.title"
          :backdrop-path="movie.backdrop_path"
          :auto-play="false"
          @player-closed="showPlayer = false"
        />
      </div>

      <!-- Details Section -->
      <div class="page-container details-container">
        <div class="details-grid">
          <div class="main-column">
            <!-- Cast & Crew -->
            <div v-if="movie.credits" class="section-card">
              <h2 class="section-title">Cast & Crew</h2>

              <div v-if="directors.length" class="crew-section">
                <h3 class="crew-title">Directors</h3>
                <div class="crew-list">
                  <span v-for="(director, index) in directors" :key="director.id">
                    {{ director.name }}<span v-if="index < directors.length - 1">, </span>
                  </span>
                </div>
              </div>

              <div v-if="writers.length" class="crew-section">
                <h3 class="crew-title">Writers</h3>
                <div class="crew-list">
                  <span v-for="(writer, index) in writers" :key="writer.id">
                    {{ writer.name }}<span v-if="index < writers.length - 1">, </span>
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

            <!-- Similar Movies -->
            <div v-if="similar.length" class="section-card similar-movies-section">
              <h2 class="section-title">Similar Movies</h2>
              <div class="media-grid media-grid--large">
                <div v-for="similarMovie in similar" :key="similarMovie.id" class="card-wrap">
                  <MediaCard
                    :item="similarMovie"
                    media-type="movie"
                    @click="goToMovie(similarMovie.id)"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="sidebar-column">
            <!-- Movie Info Sidebar -->
            <div class="section-card info-sidebar">
              <h2 class="section-title">Movie Info</h2>

              <div class="info-item">
                <strong>Release Date:</strong>
                <span>{{ formatDate(movie.release_date) }}</span>
              </div>

              <div v-if="movie.budget" class="info-item">
                <strong>Budget:</strong>
                <span>${{ formatMoney(movie.budget) }}</span>
              </div>

              <div v-if="movie.revenue" class="info-item">
                <strong>Revenue:</strong>
                <span>${{ formatMoney(movie.revenue) }}</span>
              </div>

              <div v-if="movie.production_companies?.length" class="info-item">
                <strong>Production:</strong>
                <div class="production-companies">
                  <span v-for="(company, index) in movie.production_companies" :key="company.id">
                    {{ company.name }}<span v-if="index < movie.production_companies.length - 1">, </span>
                  </span>
                </div>
              </div>

              <div v-if="movie.spoken_languages?.length" class="info-item">
                <strong>Languages:</strong>
                <div class="languages">
                  <span v-for="(lang, index) in movie.spoken_languages" :key="lang.iso_639_1">
                    {{ lang.english_name }}<span v-if="index < movie.spoken_languages.length - 1">, </span>
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
      <p>Loading movie details...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="state-overlay error">
      <h2>Failed to load movie</h2>
      <p>{{ error }}</p>
      <button @click="loadMovie" class="btn-primary">Try Again</button>
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
  name: 'MovieDetailView',
  components: {
    VideoPlayer,
    MediaCard
  },
  setup() {
    const route = useRoute()
    const router = useRouter()

    const movie = ref(null)
    const loading = ref(true)
    const error = ref(null)
    const showPlayer = ref(false)
    const isFavorite = ref(false)
    const isInWatchlist = ref(false)

    const directors = computed(() => {
      return utilsService.getDirectors(movie.value?.credits) || []
    })

    const writers = computed(() => {
      return utilsService.getWriters(movie.value?.credits) || []
    })

    const cast = computed(() => {
      return utilsService.getMainCast(movie.value?.credits, 12) || []
    })

    const similar = computed(() => {
      return movie.value?.similar?.results?.slice(0, 12) || []
    })

    const trailerKey = computed(() => {
      return utilsService.getTrailerKey(movie.value?.videos)
    })

    async function loadMovie() {
      loading.value = true
      error.value = null

      try {
        const movieId = route.params.id
        const response = await tmdbService.getMovieDetails(movieId)
        movie.value = response

        checkFavoriteStatus()
        checkWatchlistStatus()
      } catch (err) {
        error.value = err.message || 'Failed to load movie details'
      } finally {
        loading.value = false
      }
    }

    function watchMovie() {
      showPlayer.value = true
    }

    function toggleFavorite() {
      if (!movie.value) return
      const item = { ...movie.value, media_type: 'movie' }
      localStorageService.toggleFavorite(item)
      isFavorite.value = localStorageService.isFavorite(movie.value.id, 'movie')
    }

    function toggleWatchlist() {
      if (!movie.value) return
      const item = { ...movie.value, media_type: 'movie' }
      localStorageService.toggleWatchlist(item)
      isInWatchlist.value = localStorageService.isInWatchlist(movie.value.id, 'movie')
    }

    function checkFavoriteStatus() {
      if (!movie.value) return
      isFavorite.value = localStorageService.isFavorite(movie.value.id, 'movie')
    }

    function checkWatchlistStatus() {
      if (!movie.value) return
      isInWatchlist.value = localStorageService.isInWatchlist(movie.value.id, 'movie')
    }

    function goToMovie(movieId) {
      router.push(`/movie/${movieId}`)
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

    function getYear(date) {
      return utilsService.getYear(date)
    }

    function formatMoney(amount) {
      return new Intl.NumberFormat('en-US').format(amount)
    }

    watch(() => route.params.id, (newId) => {
      if (newId) {
        loadMovie()
      }
    })

    onMounted(() => {
      loadMovie()
    })

    return {
      movie,
      loading,
      error,
      showPlayer,
      isFavorite,
      isInWatchlist,
      directors,
      writers,
      cast,
      similar,
      trailerKey,
      loadMovie,
      watchMovie,
      toggleFavorite,
      toggleWatchlist,
      goToMovie,
      getPosterUrl,
      getBackdropUrl,
      getProfileUrl,
      formatRating,
      getRatingColor,
      formatRuntime,
      formatDate,
      getYear,
      formatMoney,
      goToPerson
    }
  }
}
</script>

<style scoped>
.page-layout {
  min-height: 100vh;
  background: var(--bg-primary);
  padding-bottom: 5rem;
}

.page-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 5vw;
}

.hero-section {
  position: relative;
  min-height: 70vh;
  margin-bottom: 3rem;
  display: flex;
  align-items: center;
}

.hero-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.4;
  mask-image: linear-gradient(to bottom, black 40%, transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, black 40%, transparent 100%);
}

.hero-content {
  position: relative;
  z-index: 2;
  width: 100%;
  padding-top: 100px;
}

.hero-grid {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 3rem;
  align-items: center;
}

.poster-card {
  width: 100%;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0,0,0,0.4);
}

.poster-image {
  width: 100%;
  height: auto;
  display: block;
}

.movie-title {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 800;
  letter-spacing: -0.04em;
  color: var(--text-primary);
  line-height: 1.1;
  margin-bottom: 0.5rem;
  text-transform: lowercase;
}

.movie-tagline {
  font-size: 1.25rem;
  color: var(--text-secondary);
  font-style: auto; 
  margin-bottom: 1.5rem;
}

.movie-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  margin-bottom: 2rem;
}

.meta-chip, .genre-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 6px 12px;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-secondary);
}

.meta-item {
  font-size: 1rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.rating-chip {
  background: transparent;
  border: none;
  padding: 0;
  font-size: 1rem;
}

.movie-overview {
  font-size: 1.1rem;
  color: var(--text-secondary);
  line-height: 1.6;
  max-width: 800px;
  margin-bottom: 2rem;
}

.movie-actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.btn-primary, .btn-secondary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
  border: 1px solid var(--text-primary);
  font-size: 1rem;
}

.btn-primary {
  background: var(--text-primary);
  color: var(--bg-primary);
}

.btn-primary:hover {
  background: transparent;
  color: var(--text-primary);
}

.btn-secondary {
  background: transparent;
  color: var(--text-primary);
}

.btn-secondary:hover {
  background: var(--text-primary);
  color: var(--bg-primary);
}

.icon {
  width: 20px;
  height: 20px;
}

.details-grid {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 40px;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border-color);
  text-transform: lowercase;
}

.section-card {
  margin-bottom: 3rem;
}

.crew-section {
  margin-bottom: 1.5rem;
}

.crew-title {
  font-size: 1rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.crew-list {
  font-size: 1.1rem;
  color: var(--text-primary);
}

.cast-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 20px;
}

.cast-card {
  cursor: pointer;
  transition: transform var(--transition-fast);
}

.cast-card:hover {
  transform: translateY(-4px);
}

.cast-image {
  width: 100%;
  aspect-ratio: 2/3;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 8px;
}

.cast-name {
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.cast-character {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.info-sidebar {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  padding: 24px;
}

.info-item {
  margin-bottom: 1rem;
  font-size: 0.95rem;
}

.info-item strong {
  display: block;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
}

.info-item span, .production-companies, .languages {
  color: var(--text-primary);
  line-height: 1.4;
}

.trailer-container {
  position: relative;
  padding-bottom: 56.25%;
  height: 0;
  overflow: hidden;
}

.trailer-iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 1px solid var(--border-color);
}

.state-overlay {
  min-height: 50vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.loader-circle {
  width: 40px;
  height: 40px;
  border: 2px solid var(--border-color);
  border-top-color: var(--text-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 960px) {
  .hero-grid {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .poster-column {
    display: flex;
    justify-content: center;
  }
  
  .poster-card {
    max-width: 300px;
  }
  
  .movie-meta {
    justify-content: center;
  }
  
  .movie-overview {
    text-align: center;
    margin: 0 auto 2rem;
  }
  
  .movie-actions {
    justify-content: center;
  }
  
  .details-grid {
    grid-template-columns: 1fr;
  }
}
</style>
