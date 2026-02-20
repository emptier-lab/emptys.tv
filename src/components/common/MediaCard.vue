<template>
  <div
    class="media-card"
    :class="{ 'media-card--loading': loading }"
    @click="handleClick"
  >
    <div class="poster-frame">
      <img
        v-if="posterUrl"
        :src="posterUrl"
        :alt="title"
        class="poster-img"
        loading="lazy"
        @error="imgError = true"
      />
      <div v-if="!posterUrl || imgError" class="poster-fallback">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
      </div>

      <div v-if="item.vote_average" class="rating-badge">
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

    return {
      title, subtitle, posterUrl, imgError, handleClick, formatRating
    }
  }
}
</script>

<style scoped>
.media-card {
  position: relative;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.media-card--loading {
  pointer-events: none;
  opacity: 0.5;
}

.poster-frame {
  position: relative;
  aspect-ratio: 2 / 3;
  background: var(--bg-secondary);
  border-radius: var(--border-radius-md);
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.poster-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease;
}

.media-card:hover .poster-img {
  transform: scale(1.05);
  opacity: 0.8;
}

.poster-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
}

.rating-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  padding: 4px 8px;
  border-radius: var(--border-radius-sm);
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: 0.02em;
  border: 1px solid var(--border-color);
}

.card-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.card-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
}

.card-year {
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-weight: 500;
}

@media (max-width: 480px) {
  .poster-frame {
    border-radius: var(--border-radius-sm);
  }

  .card-title {
    font-size: 0.85rem;
  }

  .card-year {
    font-size: 0.75rem;
  }
}
</style>
