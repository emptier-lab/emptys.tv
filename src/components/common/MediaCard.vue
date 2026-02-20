<template>
  <div
    class="media-card"
    :class="{ 'media-card--loading': loading }"
    @click="handleClick"
  >
    <div class="poster-frame">
      <img
        v-if="posterUrl && !imgError"
        :src="posterUrl"
        :alt="title"
        class="poster-img"
        loading="lazy"
        @error="imgError = true"
      />
      <div v-else class="poster-fallback">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
      </div>

      <div class="poster-overlay">
        <div class="play-circle">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
        </div>
      </div>

      <div v-if="item.vote_average" class="rating-pill">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="var(--amber)"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
        {{ formatRating(item.vote_average) }}
      </div>
    </div>

    <div class="card-meta">
      <h3 class="card-title">{{ title }}</h3>
      <span class="card-year">{{ subtitle }}</span>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { imageService, utilsService } from '@/services/tmdb'

export default {
  name: 'MediaCard',
  props: {
    item: { type: Object, required: true },
    mediaType: { type: String, default: 'movie', validator: v => ['movie', 'tv'].includes(v) },
    loading: { type: Boolean, default: false },
    clickable: { type: Boolean, default: true }
  },
  emits: ['click'],
  setup(props, { emit }) {
    const router = useRouter()
    const imgError = ref(false)

    const title = computed(() => props.item.title || props.item.name || 'Untitled')
    const subtitle = computed(() => {
      const d = props.item.release_date || props.item.first_air_date
      return d ? utilsService.getYear(d) : props.mediaType === 'tv' ? 'TV' : 'Film'
    })
    const posterUrl = computed(() => imageService.getPosterUrl(props.item.poster_path, 'w342'))

    function handleClick() {
      if (props.clickable) {
        emit('click', props.item)
        router.push(props.mediaType === 'tv' ? `/tv/${props.item.id}` : `/movie/${props.item.id}`)
      }
    }

    function formatRating(r) { return utilsService.formatVoteAverage(r) }

    return { title, subtitle, posterUrl, imgError, handleClick, formatRating }
  }
}
</script>

<style scoped>
.media-card {
  position: relative;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

.media-card--loading {
  pointer-events: none;
  opacity: 0.4;
}

.poster-frame {
  position: relative;
  aspect-ratio: 2 / 3;
  background: var(--bg-secondary);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
}

.poster-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.media-card:hover .poster-img {
  transform: scale(1.06);
}

.poster-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0);
  transition: background var(--transition-normal);
  opacity: 0;
}

.media-card:hover .poster-overlay {
  background: rgba(0, 0, 0, 0.35);
  opacity: 1;
}

.play-circle {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--bg-primary);
  transform: scale(0.8);
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.media-card:hover .play-circle {
  transform: scale(1);
}

.poster-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
}

.rating-pill {
  position: absolute;
  top: 8px;
  left: 8px;
  display: flex;
  align-items: center;
  gap: 3px;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  padding: 3px 8px;
  border-radius: var(--border-radius-full);
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--text-primary);
}

.card-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0 2px;
}

.card-title {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
}

.card-year {
  font-size: 0.78rem;
  color: var(--text-secondary);
  font-weight: 500;
}

@media (max-width: 480px) {
  .poster-frame {
    border-radius: var(--border-radius-md);
  }

  .card-title {
    font-size: 0.8rem;
  }

  .card-year {
    font-size: 0.72rem;
  }
}
</style>
