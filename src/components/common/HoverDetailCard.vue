<template>
  <transition name="detail-fade">
    <div
      v-if="show"
      class="hover-detail-card"
      :style="positionStyle"
      @mouseenter="onMouseEnter"
      @mouseleave="onMouseLeave"
    >
      <div class="detail-card-content">
        <!-- Header with poster and basic info -->
        <div class="detail-card-header">
          <div class="detail-poster">
            <template v-if="posterUrl">
              <img
                :src="posterUrl"
                :alt="item.title || item.name"
                class="poster-image"
              />
            </template>
            <template v-else>
              <div class="poster-placeholder">
                <svg viewBox="0 0 24 24" class="icon placeholder-icon"><path fill="currentColor" d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
              </div>
            </template>

            <div class="poster-overlay">
              <button class="play-btn" @click.stop="goToWatch">
                <svg viewBox="0 0 24 24" class="icon play-icon"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>
              </button>
            </div>

            <div v-if="item.vote_average" class="detail-rating">
              <span
                class="meta-chip rating-chip"
                :style="{ color: getRatingColor(item.vote_average) }"
              >
                <svg viewBox="0 0 24 24" class="icon star-icon"><path fill="currentColor" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                {{ formatRating(item.vote_average) }}
              </span>
            </div>
          </div>

          <div class="detail-info">
            <h3 class="detail-title">
              {{ item.title || item.name }}
            </h3>

            <div class="detail-meta">
              <span v-if="releaseYear" class="year">{{ releaseYear }}</span>
              <span v-if="runtime" class="runtime">
                <svg viewBox="0 0 24 24" class="icon meta-icon" width="14" height="14"><path fill="currentColor" d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/><path fill="currentColor" d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
                {{ formatRuntime(runtime) }}
              </span>
              <span v-if="certification" class="certification">
                {{ certification }}
              </span>
            </div>

            <div v-if="genres.length" class="detail-genres">
              <span
                v-for="genre in genres.slice(0, 3)"
                :key="genre.id"
                class="genre-chip"
              >
                {{ genre.name }}
              </span>
            </div>
          </div>
        </div>

        <!-- Overview -->
        <p v-if="item.overview" class="detail-overview">
          {{ truncateText(item.overview, 200) }}
        </p>

        <!-- Stats -->
        <div class="detail-stats">
          <div class="stat-item">
            <div class="stat-value">{{ item.vote_count || 0 }}</div>
            <div class="stat-label">Votes</div>
          </div>

          <div class="stat-item">
            <div class="stat-value">{{ item.popularity ? Math.round(item.popularity) : 0 }}</div>
            <div class="stat-label">Popularity</div>
          </div>

          <div v-if="mediaType === 'tv'" class="stat-item">
            <div class="stat-value">{{ item.number_of_seasons || '?' }}</div>
            <div class="stat-label">Seasons</div>
          </div>
        </div>

        <!-- Actions -->
        <div class="detail-actions">
          <button class="action-btn text-primary" @click.stop="goToWatch">
            <svg viewBox="0 0 24 24" class="icon"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
            Watch Now
          </button>

          <button class="action-btn text-white" @click.stop="goToDetails">
            <svg viewBox="0 0 24 24" class="icon"><path fill="currentColor" d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
            Details
          </button>
        </div>
      </div>

      <!-- Background gradient for visual effect -->
      <div class="detail-card-backdrop" :style="backdropStyle"></div>
    </div>
  </transition>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { imageService, utilsService } from '@/services/tmdb'

export default {
  name: 'HoverDetailCard',
  props: {
    item: {
      type: Object,
      required: true
    },
    mediaType: {
      type: String,
      default: 'movie',
      validator: value => ['movie', 'tv'].includes(value)
    },
    show: {
      type: Boolean,
      default: false
    },
    triggerPosition: {
      type: Object,
      default: () => ({ x: 0, y: 0 }),
    }
  },
  emits: ['mouse-enter', 'mouse-leave'],
  setup(props, { emit }) {
    const router = useRouter()

    const hoverTimeout = ref(null)

    const posterUrl = computed(() => {
      if (!props.item.poster_path) return null
      return imageService.getPosterUrl(props.item.poster_path, 'w185')
    })

    const backdropUrl = computed(() => {
      return props.item.backdrop_path
        ? imageService.getBackdropUrl(props.item.backdrop_path, 'w780')
        : null
    })

    const backdropStyle = computed(() => {
      if (!backdropUrl.value) return {}

      return {
        'background-image': `linear-gradient(to bottom, rgba(26, 29, 41, 0.7), rgba(26, 29, 41, 0.95)), url(${backdropUrl.value})`
      }
    })

    const positionStyle = computed(() => {
      const { x, y } = props.triggerPosition
      const windowWidth = window.innerWidth
      const windowHeight = window.innerHeight

      // Card dimensions (approximate)
      const cardWidth = 360
      const cardHeight = 500

      // Determine if card should appear on left or right side of trigger
      let left = x + 20 // Default: show on right side of trigger
      if (x + cardWidth + 40 > windowWidth) {
        left = x - cardWidth - 20 // Show on left side if not enough space on right
      }

      // Determine vertical position
      let top = y - 100 // Center card relative to trigger

      // Ensure card stays within viewport
      if (top + cardHeight > windowHeight) {
        top = windowHeight - cardHeight - 20
      }
      if (top < 20) top = 20

      return {
        left: `${left}px`,
        top: `${top}px`
      }
    })

    const releaseYear = computed(() => {
      const dateString = props.item.release_date || props.item.first_air_date
      return dateString ? utilsService.getYear(dateString) : null
    })

    const runtime = computed(() => {
      return props.item.runtime || null
    })

    const certification = computed(() => {
      // Assuming certification would be added through external API call
      return null
    })

    const genres = computed(() => {
      return props.item.genres || []
    })

    function formatRating(rating) {
      return utilsService.formatVoteAverage(rating)
    }

    function getRatingColor(rating) {
      return utilsService.getRatingColor(rating)
    }

    function formatRuntime(minutes) {
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
    }

    function truncateText(text, maxLength) {
      return utilsService.truncateText(text, maxLength)
    }

    function goToDetails() {
      const route = props.mediaType === 'tv'
        ? `/tv/${props.item.id}`
        : `/movie/${props.item.id}`
      router.push(route)
    }

    function goToWatch() {
      const route = `/watch/${props.mediaType}/${props.item.id}`
      router.push(route)
    }



    function onMouseEnter() {
      clearTimeout(hoverTimeout.value)
      emit('mouse-enter')
    }

    function onMouseLeave() {
      // Small delay before actually triggering mouse leave
      hoverTimeout.value = setTimeout(() => {
        emit('mouse-leave')
      }, 300)
    }



    return {
      posterUrl,
      backdropStyle,
      positionStyle,
      releaseYear,
      runtime,
      certification,
      genres,
      formatRating,
      getRatingColor,
      formatRuntime,
      truncateText,
      goToDetails,
      goToWatch,
      onMouseEnter,
      onMouseLeave
    }
  }
}
</script>

<style scoped>
.hover-detail-card {
  position: fixed;
  z-index: 1000;
  width: 360px;
  border-radius: 12px;
  overflow: hidden;
  background-color: rgba(26, 29, 41, 0.95);
  backdrop-filter: blur(10px);
  box-shadow:
    0 14px 30px rgba(0, 0, 0, 0.4),
    0 0 20px rgba(0, 212, 170, 0.15);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  border: 1px solid rgba(255, 255, 255, 0.05);
  will-change: transform, opacity;
}

.detail-card-content {
  position: relative;
  z-index: 2;
  padding: 0;
}

.detail-card-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  background-size: cover;
  background-position: center;
  opacity: 0.7;
}

.detail-card-header {
  display: flex;
  overflow: hidden;
}

.detail-poster {
  position: relative;
  width: 40%;
  aspect-ratio: 2/3;
  flex-shrink: 0;
}

.poster-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.poster-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.05);
}

.placeholder-icon {
  width: 36px;
  height: 36px;
  color: rgba(255, 255, 255, 0.2);
}

.poster-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.detail-poster:hover .poster-overlay {
  opacity: 1;
}

.play-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.play-icon {
  width: 48px;
  height: 48px;
  transform: scale(1);
  transition: all 0.3s ease;
  opacity: 0.9;
}

.play-btn:hover .play-icon {
  transform: scale(1.1);
  opacity: 1;
  color: var(--primary-color);
}


.detail-rating {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 3;
}

.rating-chip {
  background: rgba(0, 0, 0, 0.7) !important;
  backdrop-filter: blur(4px);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.8rem;
  font-weight: 600;
}

.star-icon {
  width: 14px;
  height: 14px;
  animation: star-pulse 1.5s ease-in-out infinite alternate;
}

@keyframes star-pulse {
  from {
    opacity: 0.8;
    transform: scale(1);
  }
  to {
    opacity: 1;
    transform: scale(1.2);
  }
}

.detail-info {
  width: 60%;
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.detail-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: white;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.detail-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 8px;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
}

.runtime {
  display: flex;
  align-items: center;
  gap: 4px;
}

.meta-icon {
  opacity: 0.8;
}

.certification {
  padding: 1px 4px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  font-size: 0.7rem;
}

.detail-genres {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 8px;
}

.genre-chip {
  background: rgba(0, 212, 170, 0.1);
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.7rem;
  padding: 2px 8px;
  border-radius: 4px;
  animation: fadeIn 0.5s both;
  border: 1px solid rgba(0, 212, 170, 0.2);
}

.genre-chip:nth-child(1) { animation-delay: 0.1s; }
.genre-chip:nth-child(2) { animation-delay: 0.2s; }
.genre-chip:nth-child(3) { animation-delay: 0.3s; }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}

.detail-overview {
  padding: 0 16px;
  font-size: 0.85rem;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.detail-stats {
  display: flex;
  justify-content: space-around;
  padding: 12px 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(0, 0, 0, 0.2);
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--primary-color);
}

.stat-label {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 2px;
}

.detail-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
}

.action-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  padding: 6px 12px;
  border-radius: 4px;
  transition: all var(--transition-fast);
}

.action-btn .icon {
  width: 18px;
  height: 18px;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  transform: translateY(-1px);
}

.text-primary {
  color: var(--primary-color);
}

.text-white {
  color: white;
}


/* Transitions */
.detail-fade-enter-active,
.detail-fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.detail-fade-enter-from,
.detail-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
