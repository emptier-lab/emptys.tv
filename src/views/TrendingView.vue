<template>
  <div class="trending-view page-layout">
    <div class="header-section">
      <div class="header-content">
        <h1 class="page-title">Trending</h1>
        <p class="page-subtitle">What's popular right now</p>
      </div>
    </div>

    <div class="page-container">
      <div class="trending-filters">
        <div class="toggle-group">
          <button 
            :class="['toggle-btn', { active: timeWindow === 'day' }]" 
            @click="timeWindow = 'day'; loadTrending()"
          >Today</button>
          <button 
            :class="['toggle-btn', { active: timeWindow === 'week' }]" 
            @click="timeWindow = 'week'; loadTrending()"
          >This Week</button>
        </div>
      </div>

      <div v-if="trendingContent.length > 0" class="trending-section">
        <div class="media-grid media-grid--large">
          <MediaCard
            v-for="item in trendingContent"
            :key="item.id"
            :item="item"
            :media-type="item.media_type"
            class="trending-card"
          />
        </div>
      </div>

      <div v-else-if="loading" class="state-overlay">
        <div class="loader-circle"></div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import MediaCard from '@/components/common/MediaCard.vue'
import { tmdbService } from '@/services/tmdb'

export default {
  name: 'TrendingView',
  components: {
    MediaCard
  },
  setup() {
    const trendingContent = ref([])
    const loading = ref(true)
    const timeWindow = ref('week')

    async function loadTrending() {
      loading.value = true
      try {
        const response = await tmdbService.getTrending('all', timeWindow.value)
        trendingContent.value = response.results || []
      } catch (error) {
        console.error('Failed to load trending content:', error)
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      loadTrending()
    })

    return {
      trendingContent,
      loading,
      timeWindow,
      loadTrending
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

.trending-filters {
  display: flex;
  justify-content: center;
  margin-bottom: 40px;
}

.toggle-group {
  display: flex;
  background: transparent;
  padding: 4px;
  border: 1px solid var(--border-color);
  gap: 4px;
}

.toggle-btn {
  background: transparent;
  color: var(--text-secondary);
  border: none;
  padding: 8px 24px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.toggle-btn:hover {
  color: var(--text-primary);
}

.toggle-btn.active {
  background: var(--text-primary);
  color: var(--bg-primary);
}

.trending-section {
  margin-bottom: 3rem;
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
}

@keyframes spin {
  to { transform: rotate(360deg); }
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
