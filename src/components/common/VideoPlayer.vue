<template>
  <div class="video-player">
    <div v-if="!showPlayer" class="player-placeholder" @click="initializePlayer">
      <img
        v-if="backdropUrl"
        :src="backdropUrl"
        :alt="title"
        class="backdrop-image"
      />
      <div v-else class="placeholder-bg"></div>
      <div class="play-overlay">
        <button class="play-button">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
        </button>
        <p class="play-label">{{ getPlaySubtext() }}</p>
      </div>
    </div>

    <div v-if="showPlayer" class="player-container">
      <div class="player-toolbar">
        <div class="toolbar-left">
          <h4 class="toolbar-title">{{ title }}</h4>
          <span class="toolbar-meta">{{ getPlayerMeta() }}</span>
        </div>

        <div class="toolbar-right">
          <div class="source-pills-wrap">
            <button v-if="canScrollLeft" class="scroll-arrow scroll-arrow--left" @click="scrollPills(-200)" aria-label="Scroll left">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <div
              ref="pillsContainer"
              class="source-pills"
              @mousedown="startDrag"
              @mousemove="onDrag"
              @mouseup="endDrag"
              @mouseleave="endDrag"
              @scroll="updateScrollState"
            >
              <button
                v-for="(source, index) in availableSources"
                :key="source.name"
                @click="!wasDragging && (selectedSource = index)"
                :class="['source-pill', { active: selectedSource === index }]"
              >
                {{ source.name }}
              </button>
            </div>
            <button v-if="canScrollRight" class="scroll-arrow scroll-arrow--right" @click="scrollPills(200)" aria-label="Scroll right">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
          <button class="close-btn" @click="closePlayer" aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>

      <div class="iframe-wrap">
        <iframe
          v-if="currentEmbedUrl && !needsSandbox"
          :src="currentEmbedUrl"
          width="100%"
          height="100%"
          frameborder="0"
          allowfullscreen
          webkitallowfullscreen
          mozallowfullscreen
          allow="autoplay; fullscreen; picture-in-picture"
          referrerpolicy="origin"
          loading="lazy"
          class="video-iframe"
          @error="handleIframeError"
        />
        <iframe
          v-if="currentEmbedUrl && needsSandbox"
          :src="currentEmbedUrl"
          width="100%"
          height="100%"
          frameborder="0"
          allowfullscreen
          webkitallowfullscreen
          mozallowfullscreen
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-presentation"
          allow="autoplay; fullscreen; picture-in-picture"
          referrerpolicy="origin"
          loading="lazy"
          class="video-iframe"
          @error="handleIframeError"
        />

        <div v-if="loading" class="overlay">
          <div class="spinner"></div>
          <p class="overlay-label">Connecting…</p>
        </div>

        <div v-if="error" class="overlay overlay--error">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--rose)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          <h3>Failed to load</h3>
          <p>{{ error }}</p>
          <button @click="retryLoad" class="retry-btn">Try Another Source</button>
        </div>
      </div>

      <transition name="toast">
        <div v-if="showSourceInfo" class="source-toast">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          Playing from <strong>{{ currentSource?.name }}</strong>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { videoEmbedService } from '@/services/videoEmbed'
import { imageService } from '@/services/tmdb'
import { useRouter } from 'vue-router'

export default {
  name: 'VideoPlayer',
  props: {
    tmdbId: { type: [String, Number], required: true },
    mediaType: { type: String, required: true, validator: value => ['movie', 'tv'].includes(value) },
    title: { type: String, default: 'Unknown Title' },
    backdropPath: { type: String, default: null },
    season: { type: Number, default: 1 },
    episode: { type: Number, default: 1 },
    autoPlay: { type: Boolean, default: false },
  },
  emits: ['player-opened', 'player-closed', 'source-changed'],
  setup(props, { emit }) {
    const router = useRouter()
    const showPlayer = ref(false)
    const loading = ref(false)
    const error = ref(null)
    const selectedSource = ref(0)
    const availableSources = ref([])
    const showSourceInfo = ref(true)
    const pillsContainer = ref(null)
    const canScrollLeft = ref(false)
    const canScrollRight = ref(false)
    const isDragging = ref(false)
    const wasDragging = ref(false)
    let dragStartX = 0
    let dragScrollLeft = 0
    let navigationGuard = null
    const loading = ref(false)
    const error = ref(null)
    const selectedSource = ref(0)
    const availableSources = ref([])
    const showSourceInfo = ref(true)
    const pillsContainer = ref(null)
    const canScrollLeft = ref(false)
    const canScrollRight = ref(false)
    const isDragging = ref(false)
    const wasDragging = ref(false)
    let dragStartX = 0
    let dragScrollLeft = 0

    const isMobileDevice = computed(() =>
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    )

    const backdropUrl = computed(() =>
      props.backdropPath ? imageService.getBackdropUrl(props.backdropPath, 'original') : null
    )

    const currentSource = computed(() => availableSources.value[selectedSource.value] || null)
    const currentEmbedUrl = computed(() => currentSource.value?.url || null)

    const needsSandbox = computed(() => {
      const name = currentSource.value?.name?.toLowerCase() || ''
      const unsandboxed = ['vidlink', 'nontongo', 'autoembed', 'embed.su', 'moviesapi', 'youtube']
      return !(unsandboxed.some(s => name.includes(s)) || isMobileDevice.value)
    })

    function getPlaySubtext() {
      return props.mediaType === 'tv' ? `S${props.season} · E${props.episode}` : 'Watch Now'
    }

    function getPlayerMeta() {
      return props.mediaType === 'tv' ? `S${props.season} E${props.episode}` : 'Feature Film'
    }

    function initializePlayer() {
      showPlayer.value = true
      loading.value = true
      error.value = null
      loadEmbedSources()
      emit('player-opened')
      installNavigationGuard()
    }

    function closePlayer() {
      showPlayer.value = false
      selectedSource.value = 0
      emit('player-closed')
      removeNavigationGuard()
    }

    function installNavigationGuard() {
      removeNavigationGuard()
      navigationGuard = router.beforeEach((to, from) => {
        if (showPlayer.value && to.path !== from.path) {
          return false
        }
      })
    }

    function removeNavigationGuard() {
      if (navigationGuard) {
        navigationGuard()
        navigationGuard = null
      }
    }

    async function loadEmbedSources() {
      try {
        if (props.mediaType === 'movie') {
          availableSources.value = videoEmbedService.getMovieEmbeds(props.tmdbId, isMobileDevice.value)
        } else {
          availableSources.value = videoEmbedService.getTVEmbeds(props.tmdbId, props.season, props.episode, isMobileDevice.value)
        }

        if (availableSources.value.length === 0) {
          error.value = 'No sources available.'
        } else {
          loading.value = false
          setTimeout(() => showSourceInfo.value = false, 5000)
        }
      } catch (err) {
        error.value = 'Failed to connect.'
        loading.value = false
      }
    }

    function handleIframeError() {
      if (selectedSource.value < availableSources.value.length - 1) {
        selectedSource.value++
      } else {
        error.value = 'All sources unavailable.'
      }
    }

    function retryLoad() {
      handleIframeError()
      error.value = null
      loading.value = true
      setTimeout(() => loading.value = false, 800)
    }

    function updateScrollState() {
      const el = pillsContainer.value
      if (!el) return
      canScrollLeft.value = el.scrollLeft > 2
      canScrollRight.value = el.scrollLeft < el.scrollWidth - el.clientWidth - 2
    }

    function scrollPills(delta) {
      const el = pillsContainer.value
      if (!el) return
      el.scrollBy({ left: delta, behavior: 'smooth' })
    }

    function startDrag(e) {
      isDragging.value = true
      wasDragging.value = false
      dragStartX = e.pageX - pillsContainer.value.offsetLeft
      dragScrollLeft = pillsContainer.value.scrollLeft
      pillsContainer.value.style.cursor = 'grabbing'
    }

    function onDrag(e) {
      if (!isDragging.value) return
      e.preventDefault()
      const x = e.pageX - pillsContainer.value.offsetLeft
      const walk = x - dragStartX
      if (Math.abs(walk) > 3) wasDragging.value = true
      pillsContainer.value.scrollLeft = dragScrollLeft - walk
    }

    function endDrag() {
      isDragging.value = false
      if (pillsContainer.value) pillsContainer.value.style.cursor = 'grab'
    }

    watch(selectedSource, () => {
      if (currentSource.value) {
        emit('source-changed', currentSource.value)
        showSourceInfo.value = true
        setTimeout(() => showSourceInfo.value = false, 4000)
        loading.value = true
        setTimeout(() => loading.value = false, 600)
      }
    })

    watch(availableSources, () => {
      nextTick(() => updateScrollState())
    })

    onMounted(() => {
      if (props.autoPlay) initializePlayer()
    })

    onUnmounted(() => {
      removeNavigationGuard()
    })

    return {
      showPlayer, loading, error, selectedSource, availableSources,
      showSourceInfo, backdropUrl, currentSource, currentEmbedUrl,
      needsSandbox, getPlaySubtext, getPlayerMeta, initializePlayer,
      closePlayer, handleIframeError, retryLoad,
      pillsContainer, canScrollLeft, canScrollRight, wasDragging,
      updateScrollState, scrollPills, startDrag, onDrag, endDrag
    }
  }
}
</script>

<style scoped>
.video-player {
  width: 100%;
  overflow: hidden;
  position: relative;
  border-radius: var(--border-radius-lg);
  background: var(--bg-secondary);
}

.player-placeholder {
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.placeholder-bg {
  position: absolute;
  inset: 0;
  background: var(--bg-secondary);
}

.backdrop-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.35;
  transition: opacity 0.5s ease, transform 2s ease;
}

.player-placeholder:hover .backdrop-image {
  opacity: 0.5;
  transform: scale(1.03);
}

.play-overlay {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

.play-button {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform var(--transition-fast), background var(--transition-fast);
}

.play-button:hover {
  transform: scale(1.1);
  background: rgba(255, 255, 255, 0.2);
}

.play-label {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-secondary);
  letter-spacing: 0.02em;
}

.player-container {
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
}

.player-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  gap: 12px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.toolbar-title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.toolbar-meta {
  font-size: 0.8rem;
  color: var(--text-secondary);
  font-weight: 500;
  flex-shrink: 0;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.source-pills-wrap {
  display: flex;
  align-items: center;
  gap: 4px;
  position: relative;
}

.scroll-arrow {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: all var(--transition-fast);
  z-index: 2;
}

.scroll-arrow:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--border-hover);
}

.source-pills {
  display: flex;
  gap: 4px;
  overflow-x: auto;
  scrollbar-width: none;
  max-width: 460px;
  cursor: grab;
  -webkit-user-select: none;
  user-select: none;
}

.source-pills::-webkit-scrollbar {
  display: none;
}

.source-pill {
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-full);
  padding: 5px 14px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: all var(--transition-fast);
}

.source-pill:hover {
  color: var(--text-primary);
  border-color: var(--border-hover);
}

.source-pill.active {
  background: var(--text-primary);
  color: var(--bg-primary);
  border-color: var(--text-primary);
}

.close-btn {
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-full);
  color: var(--text-secondary);
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

.close-btn:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.06);
}

.iframe-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  background: #000;
  min-height: 360px;
}

.video-iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: none;
}

.overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  z-index: 5;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.overlay-label {
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.overlay--error h3 {
  color: var(--text-primary);
  font-size: 1.1rem;
  margin: 0;
}

.overlay--error p {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin: 0;
}

.retry-btn {
  background: transparent;
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-full);
  padding: 10px 24px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  margin-top: 8px;
  transition: all var(--transition-fast);
}

.retry-btn:hover {
  background: var(--text-primary);
  color: var(--bg-primary);
}

.source-toast {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-glass);
  backdrop-filter: blur(16px);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-full);
  padding: 8px 18px;
  font-size: 0.8rem;
  color: var(--text-secondary);
  white-space: nowrap;
  pointer-events: none;
}

.source-toast strong {
  color: var(--text-primary);
}

.toast-enter-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.toast-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(8px);
}

@media (max-width: 768px) {
  .player-toolbar {
    flex-direction: column;
    align-items: flex-start;
    padding: 10px 12px;
  }

  .toolbar-right {
    width: 100%;
    justify-content: space-between;
  }

  .source-pills {
    max-width: calc(100% - 80px);
  }

  .play-button {
    width: 52px;
    height: 52px;
  }
}
</style>
