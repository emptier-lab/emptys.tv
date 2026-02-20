<template>
  <div class="not-found-view page-layout">
    <div class="page-container">
      <div class="not-found-content">
        <div class="error-header">
          <h1 class="error-code">404</h1>
        </div>

        <div class="error-message">
          <h2 class="error-title">Page not found</h2>
          <p class="error-description">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div class="action-buttons">
          <button @click="goHome" class="btn-primary">
            Back to Home
          </button>
          <button @click="goBack" class="btn-secondary">
            Go Back
          </button>
          <button @click="searchContent" class="btn-secondary">
            Search
          </button>
        </div>

        <div class="suggestions">
          <h3 class="suggestions-title">Popular Content</h3>
          <div v-if="popularContent.length > 0" class="media-grid media-grid--large">
            <div v-for="item in popularContent" :key="item.id" class="card-wrap">
              <MediaCard
                :item="item"
                :media-type="item.media_type || 'movie'"
              />
            </div>
          </div>

          <div v-else class="loader-box">
            <div class="loader-circle"></div>
            <p>Loading suggestions...</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import MediaCard from '@/components/common/MediaCard.vue'
import { tmdbService } from '@/services/tmdb'

export default {
  name: 'NotFoundView',
  components: {
    MediaCard
  },
  setup() {
    const router = useRouter()
    const popularContent = ref([])

    function goHome() {
      router.push('/')
    }

    function goBack() {
      router.back()
    }

    function searchContent() {
      router.push('/search')
    }

    async function loadPopularContent() {
      try {
        const response = await tmdbService.getTrending('all', 'week')
        popularContent.value = response.results?.slice(0, 6) || []
      } catch (error) {
        console.error('Failed to load popular content:', error)
      }
    }

    onMounted(() => {
      loadPopularContent()
    })

    return {
      popularContent,
      goHome,
      goBack,
      searchContent
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
  padding: 0 5vw;
}

.not-found-content {
  text-align: center;
  margin: 0 auto;
}

.error-header {
  margin-bottom: 24px;
}

.error-code {
  font-size: clamp(6rem, 15vw, 10rem);
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1;
  letter-spacing: -0.04em;
}

.error-message {
  margin-bottom: 48px;
}

.error-title {
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.04em;
  margin-bottom: 12px;
  text-transform: lowercase;
}

.error-description {
  font-size: 1.1rem;
  color: var(--text-secondary);
  max-width: 600px;
  margin: 0 auto;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 80px;
  flex-wrap: wrap;
}

.btn-primary, .btn-secondary {
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

.suggestions {
  margin-top: 40px;
  text-align: left;
}

.suggestions-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 32px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 16px;
  text-transform: lowercase;
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

@media (max-width: 768px) {
  .page-layout {
    padding-top: 80px;
  }

  .action-buttons {
    flex-direction: column;
    align-items: stretch;
    max-width: 300px;
    margin-left: auto;
    margin-right: auto;
  }
}
</style>
