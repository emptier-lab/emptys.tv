<template>
  <div class="watchlist-view page-layout">
    <div class="header-section">
      <div class="header-content">
        <h1 class="page-title">Watchlist</h1>
        <p class="page-subtitle">Movies and TV shows you want to watch later.</p>
      </div>
    </div>

    <div class="page-container">
      <div v-if="watchlist.length > 0" class="watchlist-grid media-grid media-grid--large">
        <div
          v-for="item in watchlist"
          :key="item.id"
          class="card-wrap"
        >
          <div class="media-card-wrapper">
            <MediaCard
              :item="item"
              :media-type="item.media_type || 'movie'"
            />
            <div class="watch-by-date" v-if="item.watchByDate">
              <span class="date-chip">
                Watch by: {{ formatDate(item.watchByDate) }}
              </span>
            </div>
            <div class="watchlist-actions">
              <button
                class="action-btn edit-btn"
                @click="openDatePicker(item)"
                title="Set reminder date"
              >
                <svg viewBox="0 0 24 24"><path fill="currentColor" d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zm-7-2h5v-5h-5v5z"/></svg>
              </button>
              <button
                class="action-btn remove-btn"
                @click="removeFromWatchlist(item)"
                title="Remove from watchlist"
              >
                <svg viewBox="0 0 24 24"><path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <svg viewBox="0 0 24 24" class="empty-icon"><path fill="currentColor" d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13z"/></svg>
        <h2>Your watchlist is empty</h2>
        <p>Add movies and TV shows you want to watch later!</p>
        <button @click="$router.push('/')" class="btn-primary">
          Browse Content
        </button>
      </div>
    </div>

    <!-- Date Picker Dialog -->
    <div v-if="dateDialog.show" class="modal-overlay" @click.self="dateDialog.show = false">
      <div class="modal-content">
        <h3 class="modal-title">Set Watch-by Date</h3>
        <p class="modal-desc">Select a date by when you plan to watch "{{ dateDialog.item?.title || dateDialog.item?.name }}"</p>
        <input 
          type="date" 
          v-model="dateDialog.selectedDate" 
          class="date-input"
        />
        <div class="modal-actions">
          <button class="btn-text" @click="dateDialog.show = false">Cancel</button>
          <button class="btn-primary" @click="setWatchByDate">Save</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import MediaCard from '@/components/common/MediaCard.vue'
import { localStorageService } from '@/services/localStorage'
import { useRouter } from 'vue-router'

export default {
  name: 'WatchlistView',
  components: {
    MediaCard
  },
  setup() {
    const router = useRouter()
    const watchlist = ref([])
    const dateDialog = ref({
      show: false,
      item: null,
      selectedDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().substr(0, 10),
    })

    function loadWatchlist() {
      watchlist.value = localStorageService.getWatchlist()
      console.log('Watchlist loaded:', watchlist.value.length)
    }

    function removeFromWatchlist(item) {
      if (item && item.id) {
        localStorageService.removeFromWatchlist(item.id, item.media_type)
        loadWatchlist() // Reload watchlist after removal
      }
    }

    function formatDate(dateString) {
      if (!dateString) return 'No date set'

      const date = new Date(dateString)
      // Account for timezone offset to avoid previous day display issue
      const userTimezoneOffset = date.getTimezoneOffset() * 60000
      const localDate = new Date(date.getTime() + userTimezoneOffset)

      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }).format(localDate)
    }

    function openDatePicker(item) {
      dateDialog.value.item = item
      if (item.watchByDate) {
        dateDialog.value.selectedDate = new Date(item.watchByDate).toISOString().substr(0, 10)
      } else {
        // Set default to 3 days from now
        dateDialog.value.selectedDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().substr(0, 10)
      }
      dateDialog.value.show = true
    }

    function setWatchByDate() {
      if (dateDialog.value.item && dateDialog.value.selectedDate) {
        const selectedDate = new Date(dateDialog.value.selectedDate)

        // Update the watch-by date
        localStorageService.updateWatchByDate(
          dateDialog.value.item.id,
          dateDialog.value.item.media_type,
          selectedDate
        )

        // Reload watchlist to show updated date
        loadWatchlist()

        // Close dialog
        dateDialog.value.show = false
      }
    }

    function handleStorageEvent() {
      loadWatchlist()
    }

    onMounted(() => {
      loadWatchlist()
      window.addEventListener('storage', handleStorageEvent)
    })

    onBeforeUnmount(() => {
      window.removeEventListener('storage', handleStorageEvent)
    })

    return {
      watchlist,
      dateDialog,
      removeFromWatchlist,
      formatDate,
      openDatePicker,
      setWatchByDate
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

.watchlist-grid {
  margin-bottom: 40px;
}

.media-card-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.watchlist-actions {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.media-card-wrapper:hover .watchlist-actions,
.media-card-wrapper:focus-within .watchlist-actions {
  opacity: 1;
}

.action-btn {
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
  transition: all var(--transition-fast);
}

.action-btn svg {
  width: 18px;
  height: 18px;
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

.watch-by-date {
  position: absolute;
  bottom: 15px;
  left: 15px;
  z-index: 10;
  pointer-events: none;
}

.date-chip {
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  padding: 4px 12px;
  font-size: 0.8rem;
  font-weight: 600;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.5);
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

.btn-text {
  background: transparent;
  color: var(--text-secondary);
  border: none;
  padding: 12px 24px;
  font-weight: 600;
  cursor: pointer;
  transition: color var(--transition-fast);
}

.btn-text:hover {
  color: var(--text-primary);
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.8);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  padding: 32px;
  width: 100%;
  max-width: 400px;
}

.modal-title {
  font-size: 1.5rem;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.modal-desc {
  font-size: 0.95rem;
  color: var(--text-secondary);
  margin-bottom: 24px;
  line-height: 1.5;
}

.date-input {
  width: 100%;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  padding: 12px;
  font-size: 1rem;
  margin-bottom: 32px;
  outline: none;
}

.date-input:focus {
  border-color: var(--text-primary);
}

/* Light mode overrides for date input */
::-webkit-calendar-picker-indicator {
  filter: invert(1);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
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
