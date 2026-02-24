<template>
  <div class="favorites-view page-layout">
    <div class="header-section">
      <div class="header-content">
        <h1 class="page-title">Favorites</h1>
        <p class="page-subtitle">Your favorite movies and TV shows.</p>
      </div>
    </div>

    <div class="page-container">
      <div v-if="favorites.length > 0" class="favorites-grid media-grid media-grid--large">
        <div
          v-for="item in favorites"
          :key="item.id"
          class="card-wrap"
        >
          <div class="media-card-wrapper">
            <MediaCard
              :item="item"
              :media-type="item.media_type || 'movie'"
            />
            <button
              class="action-btn remove-btn"
              @click="removeFavorite(item)"
              title="Remove from favorites"
            >
              <svg viewBox="0 0 24 24"><path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            </button>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <svg viewBox="0 0 24 24" class="empty-icon"><path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
        <h2>No favorites yet</h2>
        <p>Start adding movies and TV shows to your favorites!</p>
        <button @click="$router.push('/')" class="btn-primary">
          Browse Content
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import MediaCard from '@/components/common/MediaCard.vue'
import { localStorageService } from '@/services/localStorage'

export default {
  name: 'FavoritesView',
  components: {
    MediaCard
  },
  setup() {
    const favorites = ref([])

    function loadFavorites() {
      favorites.value = localStorageService.getFavorites()
    }

    function removeFavorite(item) {
      localStorageService.toggleFavorite(item)
      loadFavorites() // Reload the list
    }

    onMounted(() => {
      loadFavorites()
    })

    return {
      favorites,
      loadFavorites,
      removeFavorite
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

.favorites-grid {
  margin-bottom: 40px;
}

.media-card-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.action-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  cursor: pointer;
  opacity: 0;
  transition: all var(--transition-fast);
}

.action-btn svg {
  width: 18px;
  height: 18px;
}

.media-card-wrapper:hover .action-btn,
.media-card-wrapper:focus-within .action-btn {
  opacity: 1;
}

.action-btn:hover {
  background: var(--text-primary);
  color: var(--bg-primary);
}

.action-btn.remove-btn:hover {
  background: #ff4757;
  color: white;
  border-color: #ff4757;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  text-align: center;
  color: var(--text-secondary);
  padding: 60px 20px;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.empty-icon {
  width: 64px;
  height: 64px;
  margin-bottom: 24px;
  opacity: 0.5;
}

.empty-state h2 {
  font-size: 1.5rem;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.empty-state p {
  margin-bottom: 32px;
}

.btn-primary {
  background: var(--text-primary);
  color: var(--bg-primary);
  border: 1px solid var(--text-primary);
  padding: 12px 24px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-primary:hover {
  background: transparent;
  color: var(--text-primary);
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
