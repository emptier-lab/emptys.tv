<template>
  <div class="person-detail-view page-layout">
    <div v-if="person" class="content-wrapper">
      <!-- Hero Section -->
      <div class="hero-section">
        <div class="page-container hero-content">
          <div class="profile-layout">
            <div class="profile-sidebar">
              <div class="profile-card">
                <img
                  v-if="person.profile_path"
                  :src="getProfileUrl(person.profile_path)"
                  :alt="person.name"
                  class="profile-image"
                />
                <div v-else class="profile-placeholder">
                  <svg viewBox="0 0 24 24" class="person-icon"><path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                </div>
              </div>
            </div>

            <div class="profile-main">
              <div class="person-info">
                <h1 class="person-name">{{ person.name }}</h1>

                <div class="person-meta">
                  <span
                    v-if="person.popularity"
                    class="meta-item popularity-chip"
                  >
                    <svg viewBox="0 0 24 24" class="fire-icon"><path fill="currentColor" d="M17.5 11.2c-.3-.3-.8-.3-1.1 0-.3.4-1 1-1.6 1.7-1.3-1.7-.8-3.4-.8-3.5 0-.5-.5-.9-1-1-.5-.1-1 .2-1.3.6C10.6 11 9.2 13.9 9.2 15c0 1.5 1.2 2.8 2.8 2.8s2.8-1.2 2.8-2.8c0-.6-.3-1.4-.7-2.3.9-.9 1.6-1.5 1.6-1.5.3-.2.4-.7.1-1zM12 22C6.5 22 2 17.5 2 12S6.5 2 12 2s10 4.5 10 10-4.5 10-10 10zm-1-15.6c-.4.4-2.8 2.9-2.8 5.6 0 2.1 1.7 3.8 3.8 3.8s3.8-1.7 3.8-3.8c0-1.8-1-3.1-2-4.1-1.2-1.3-2.3-2.3-2.8-1.5z"/></svg>
                    {{ formatPopularity(person.popularity) }}
                  </span>

                  <span v-if="person.known_for_department" class="meta-item">
                    {{ person.known_for_department }}
                  </span>

                  <span v-if="person.birthday" class="meta-item">
                    Born: {{ formatDate(person.birthday) }}
                  </span>

                  <span v-if="person.place_of_birth" class="meta-item">
                    {{ person.place_of_birth }}
                  </span>
                </div>

                <div class="person-biography">
                  <p v-if="person.biography">{{ person.biography }}</p>
                  <p v-else>No biography available for {{ person.name }}.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Details Section -->
      <div class="details-section page-container">
        <div class="details-layout">
          <div class="details-main">
            <!-- Movie Credits -->
            <div v-if="movieCredits.length" class="section-card">
              <h2 class="section-title">Movie Credits</h2>
              <div class="media-grid media-grid--large">
                <div v-for="movie in movieCredits" :key="movie.id" class="card-wrap">
                  <MediaCard
                    :item="movie"
                    media-type="movie"
                  />
                </div>
              </div>
            </div>

            <!-- TV Credits -->
            <div v-if="tvCredits.length" class="section-card">
              <h2 class="section-title">TV Credits</h2>
              <div class="media-grid media-grid--large">
                <div v-for="show in tvCredits" :key="show.id" class="card-wrap">
                  <MediaCard
                    :item="show"
                    media-type="tv"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="details-sidebar">
            <!-- Personal Info -->
            <div class="section-card">
              <h2 class="section-title">Personal Info</h2>

              <div v-if="person.known_for_department" class="info-item">
                <strong>Known For:</strong>
                <span>{{ person.known_for_department }}</span>
              </div>

              <div v-if="person.birthday" class="info-item">
                <strong>Birthday:</strong>
                <span>{{ formatDate(person.birthday) }}</span>
              </div>

              <div v-if="person.deathday" class="info-item">
                <strong>Death:</strong>
                <span>{{ formatDate(person.deathday) }}</span>
              </div>

              <div v-if="person.place_of_birth" class="info-item">
                <strong>Place of Birth:</strong>
                <span>{{ person.place_of_birth }}</span>
              </div>

              <div v-if="person.also_known_as?.length" class="info-item">
                <strong>Also Known As:</strong>
                <div class="aliases">
                  <div v-for="alias in person.also_known_as.slice(0, 5)" :key="alias" class="alias">
                    {{ alias }}
                  </div>
                </div>
              </div>

              <div v-if="person.homepage" class="info-item">
                <strong>Homepage:</strong>
                <a :href="person.homepage" target="_blank" class="homepage-link">
                  Visit Website
                  <svg viewBox="0 0 24 24" width="16" height="16" class="icon-link"><path fill="currentColor" d="M19 19H5V5h7V3H5a2 2 0 00-2 2v14a2 2 0 002 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/></svg>
                </a>
              </div>
            </div>

            <!-- External Links -->
            <div v-if="externalIds" class="section-card">
              <h2 class="section-title">External Links</h2>
              <div class="external-links">
                <a
                  v-if="externalIds.imdb_id"
                  :href="`https://www.imdb.com/name/${externalIds.imdb_id}`"
                  target="_blank"
                  class="external-link-btn"
                >
                  IMDb
                </a>

                <a
                  v-if="externalIds.twitter_id"
                  :href="`https://twitter.com/${externalIds.twitter_id}`"
                  target="_blank"
                  class="external-link-btn"
                >
                  Twitter
                </a>

                <a
                  v-if="externalIds.instagram_id"
                  :href="`https://instagram.com/${externalIds.instagram_id}`"
                  target="_blank"
                  class="external-link-btn"
                >
                  Instagram
                </a>

                <a
                  v-if="externalIds.facebook_id"
                  :href="`https://facebook.com/${externalIds.facebook_id}`"
                  target="_blank"
                  class="external-link-btn"
                >
                  Facebook
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else-if="loading" class="state-overlay">
      <div class="loader-circle"></div>
      <p class="loading-text">Loading...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="state-overlay error">
      <h2>Failed to load person</h2>
      <p>{{ error }}</p>
      <button @click="loadPerson" class="retry-btn">
        Try Again
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import MediaCard from '@/components/common/MediaCard.vue'
import { tmdbService, imageService, utilsService } from '@/services/tmdb'

export default {
  name: 'PersonDetailView',
  components: {
    MediaCard
  },
  setup() {
    const route = useRoute()

    const person = ref(null)
    const loading = ref(true)
    const error = ref(null)
    const externalIds = ref(null)

    const movieCredits = computed(() => {
      if (!person.value?.movie_credits) return []
      return person.value.movie_credits.cast
        .filter(movie => movie.poster_path && movie.popularity > 1)
        .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
        .slice(0, 20)
    })

    const tvCredits = computed(() => {
      if (!person.value?.tv_credits) return []
      return person.value.tv_credits.cast
        .filter(show => show.poster_path && show.popularity > 1)
        .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
        .slice(0, 20)
    })

    async function loadPerson() {
      try {
        loading.value = true
        error.value = null

        const personId = route.params.id
        if (!personId) {
          throw new Error('No person ID provided')
        }

        const response = await tmdbService.getPersonDetails(personId)
        person.value = response

        try {
          const externalResponse = await tmdbService.getPersonExternalIds(personId)
          externalIds.value = externalResponse
        } catch (err) {
          // external IDs unavailable
        }
      } catch (err) {
        error.value = err.message || 'Failed to load person'
      } finally {
        loading.value = false
      }
    }

    function getProfileUrl(path) {
      if (!path) return ''
      return imageService.getProfileUrl(path, 'h632')
    }

    function formatDate(dateString) {
      if (!dateString) return ''
      const options = { year: 'numeric', month: 'long', day: 'numeric' }
      return new Date(dateString).toLocaleDateString(undefined, options)
    }

    function formatPopularity(popularity) {
      return popularity ? popularity.toFixed(1) : ''
    }

    onMounted(() => {
      loadPerson()
    })

    watch(() => route.params.id, (newId) => {
      if (newId) {
        loadPerson()
      }
    })

    return {
      person,
      loading,
      error,
      externalIds,
      movieCredits,
      tvCredits,
      loadPerson,
      getProfileUrl,
      formatDate,
      formatPopularity
    }
  }
}
</script>

<style scoped>
.page-layout {
  padding-top: 80px;
}

.page-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 5vw;
}

.hero-section {
  position: relative;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 40px;
}

.hero-content {
  padding: 60px 5vw;
}

.profile-layout {
  display: flex;
  gap: 40px;
  align-items: flex-start;
}

.profile-sidebar {
  flex: 0 0 300px;
}

.profile-main {
  flex: 1;
  min-width: 0;
}

.profile-card {
  width: 100%;
  aspect-ratio: 2/3;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  position: relative;
  overflow: hidden;
}

.profile-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.profile-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--border-color);
}

.person-icon {
  width: 64px;
  height: 64px;
}

.person-info {
  display: flex;
  flex-direction: column;
}

.person-name {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 800;
  margin-bottom: 1rem;
  color: var(--text-primary);
  letter-spacing: -0.04em;
  line-height: 1.1;
  text-transform: lowercase;
}

.person-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-bottom: 32px;
}

.meta-item {
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-weight: 500;
  padding: 6px 12px;
  border: 1px solid var(--border-color);
  background: transparent;
}

.popularity-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--text-primary);
  color: var(--bg-primary);
  border-color: var(--text-primary);
}

.fire-icon {
  width: 16px;
  height: 16px;
}

.person-biography {
  font-size: 1.1rem;
  line-height: 1.7;
  color: var(--text-secondary);
  text-align: justify;
  max-width: 800px;
}

.person-biography p {
  margin-bottom: 1em;
}

.details-layout {
  display: flex;
  gap: 40px;
  align-items: flex-start;
}

.details-main {
  flex: 1;
  min-width: 0;
}

.details-sidebar {
  flex: 0 0 300px;
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.section-card {
  margin-bottom: 60px;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 2rem;
  color: var(--text-primary);
  letter-spacing: -0.02em;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
  text-transform: lowercase;
}

.info-item {
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
  gap: 4px;
}

.info-item strong {
  color: var(--text-primary);
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.info-item span, .alias {
  color: var(--text-secondary);
  font-size: 1rem;
  line-height: 1.5;
}

.aliases {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 4px;
}

.alias {
  font-size: 0.95rem;
}

.homepage-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--text-primary);
  text-decoration: none;
  font-weight: 500;
  transition: opacity var(--transition-fast);
}

.homepage-link:hover {
  opacity: 0.7;
}

.icon-link {
  margin-top: 2px;
}

.external-links {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.external-link-btn {
  display: inline-block;
  padding: 8px 16px;
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all var(--transition-fast);
}

.external-link-btn:hover {
  color: var(--text-primary);
  border-color: var(--text-primary);
}

.state-overlay {
  min-height: 50vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
}

.loader-circle {
  width: 40px;
  height: 40px;
  border: 2px solid var(--border-color);
  border-top-color: var(--text-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  color: var(--text-secondary);
  font-size: 1.1rem;
}

.state-overlay.error h2 {
  font-size: 1.5rem;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.state-overlay.error p {
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

@media (max-width: 960px) {
  .profile-layout {
    flex-direction: column;
  }
  
  .profile-sidebar {
    flex: none;
    width: 200px;
    margin: 0 auto;
  }
  
  .person-name {
    text-align: center;
  }
  
  .person-meta {
    justify-content: center;
  }
  
  .person-biography {
    margin: 0 auto;
  }
  
  .details-layout {
    flex-direction: column-reverse;
  }
  
  .details-sidebar {
    width: 100%;
    flex: none;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 20px;
  }
  
  .section-card {
    flex: 1;
    min-width: 280px;
  }
}
</style>
