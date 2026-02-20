<template>
  <div class="video-player">
    <div v-if="!showPlayer" class="player-placeholder" @click="initializePlayer">
      <div class="play-overlay">
        <button class="play-button">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="play-icon">
            <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm14.024-.983a1.125 1.125 0 010 1.966l-5.603 3.113A1.125 1.125 0 019 15.113V8.887c0-.857.921-1.4 1.671-.983l5.603 3.113z" clip-rule="evenodd" />
          </svg>
        </button>
        <h3 class="play-text">Click to Watch</h3>
        <p class="play-subtext">{{ getPlaySubtext() }}</p>
      </div>
      <img
        v-if="backdropUrl"
        :src="backdropUrl"
        :alt="title"
        class="backdrop-image"
      />
      <div v-else class="mesh-backdrop"></div>
    </div>

    <div v-if="showPlayer" class="player-container">
      <div class="player-header">
        <div class="player-info">
          <h4 class="player-title">{{ title }}</h4>
          <p class="player-meta">{{ getPlayerMeta() }}</p>
        </div>

        <div class="player-controls">
          <div class="source-selector">
            <button
              v-for="(source, index) in availableSources"
              :key="source.name"
              @click="selectedSource = index"
              :class="['source-btn', { active: selectedSource === index }]"
            >
              {{ source.name }}
            </button>
          </div>

          <button class="close-btn" @click="closePlayer">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="close-icon">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>
      </div>

      <div class="iframe-container">
        <!-- Iframe without sandbox restrictions for specific sources and mobile devices -->
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

        <!-- Desktop iframe with sandbox for other sources -->
        <iframe
          v-if="currentEmbedUrl && needsSandbox"
          :src="currentEmbedUrl"
          width="100%"
          height="100%"
          frameborder="0"
          allowfullscreen
          webkitallowfullscreen
          mozallowfullscreen
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-presentation allow-top-navigation-by-user-activation"
          allow="autoplay; fullscreen; picture-in-picture"
          referrerpolicy="origin"
          loading="lazy"
          class="video-iframe"
          @error="handleIframeError"
        />

        <div v-if="loading" class="overlay shimmer">
          <div class="loader-circle"></div>
          <p class="overlay-text">Establishing connection...</p>
        </div>

        <div v-if="error" class="overlay error-overlay">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="var(--error-color)" class="error-icon">
            <path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clip-rule="evenodd" />
          </svg>
          <h3>Failed to load video</h3>
          <p>{{ error }}</p>
          <button @click="retryLoad" class="retry-btn">Try Another Source</button>
        </div>
      </div>

      <div v-if="showSourceInfo" class="source-info">
        <div class="source-alert">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="info-icon">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clip-rule="evenodd" />
          </svg>
          <span class="info-text">Playing from <strong>{{ currentSource?.name }}</strong>. Switch sources above if it hangs.</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue'
import { videoEmbedService } from '@/services/videoEmbed'
import { imageService } from '@/services/tmdb'

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
    const showPlayer = ref(false)
    const loading = ref(false)
    const error = ref(null)
    const selectedSource = ref(0)
    const availableSources = ref([])
    const showSourceInfo = ref(true)

    const isMobileDevice = computed(() => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    })

    const backdropUrl = computed(() => {
      return props.backdropPath ? imageService.getBackdropUrl(props.backdropPath, 'original') : null
    })

    const currentSource = computed(() => availableSources.value[selectedSource.value] || null)
    const currentEmbedUrl = computed(() => currentSource.value?.url || null)

    const needsSandbox = computed(() => {
      const name = currentSource.value?.name?.toLowerCase() || ''
      const unsandboxed = ['vidlink', 'nontongo', 'autoembed', 'embed.su', 'moviesapi']
      return !(unsandboxed.some(s => name.includes(s)) || isMobileDevice.value)
    })

    function getPlaySubtext() {
      return props.mediaType === 'tv' ? `Season ${props.season} ∙ Episode ${props.episode}` : 'Full Movie (1080p, 4K)'
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
    }

    function closePlayer() {
      showPlayer.value = false
      selectedSource.value = 0
      emit('player-closed')
    }

    function loadEmbedSources() {
      try {
        if (props.mediaType === 'movie') {
          availableSources.value = videoEmbedService.getMovieEmbeds(props.tmdbId, isMobileDevice.value)
        } else {
          availableSources.value = videoEmbedService.getTVEmbeds(props.tmdbId, props.season, props.episode, isMobileDevice.value)
        }

        if (availableSources.value.length === 0) {
          error.value = 'No streaming sources available in your region.'
        } else {
          loading.value = false
          // Auto hide info box after delay
          setTimeout(() => showSourceInfo.value = false, 6000)
        }
      } catch (err) {
        error.value = 'Failed to connect to provider network.'
        loading.value = false
      }
    }

    function handleIframeError() {
      // Try next source automatically
      if (selectedSource.value < availableSources.value.length - 1) {
        selectedSource.value++
      } else {
        error.value = 'Stream servers unresponsive.'
      }
    }

    function retryLoad() {
      handleIframeError()
      error.value = null
      loading.value = true
      setTimeout(() => loading.value = false, 1000)
    }

    watch(selectedSource, () => {
      if (currentSource.value) {
        emit('source-changed', currentSource.value)
        showSourceInfo.value = true
        setTimeout(() => showSourceInfo.value = false, 4000)
        loading.value = true 
        setTimeout(() => loading.value = false, 800) // Synthetic load feel
      }
    })

    onMounted(() => {
      if (props.autoPlay) initializePlayer()
    })

    return {
      showPlayer,
      loading,
      error,
      selectedSource,
      availableSources,
      showSourceInfo,
      backdropUrl,
      currentSource,
      currentEmbedUrl,
      needsSandbox,
      getPlaySubtext,
      getPlayerMeta,
      initializePlayer,
      closePlayer,
      handleIframeError,
      retryLoad
    }
  }
}
</script>

<style scoped>
.video-player {
  width: 100%;
  overflow: hidden;
  position: relative;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);
}

/* PLACEHOLDER STATE */
.player-placeholder {
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  min-height: 300px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.mesh-backdrop {
  position: absolute;
  inset: -50%;
  background: var(--bg-primary);
  z-index: 0;
}

.backdrop-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.4;
  mask-image: linear-gradient(to top, transparent, black 40%);
  -webkit-mask-image: linear-gradient(to top, transparent, black 40%);
  transition: opacity var(--transition-slow), transform 3s ease;
}

.player-placeholder:hover .backdrop-image {
  opacity: 0.6;
  transform: scale(1.05);
}

.play-overlay {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
}

.play-button {
  background: transparent;
  border: 1px solid var(--text-primary);
  color: var(--text-primary);
  border-radius: 0;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  transition: all var(--transition-fast);
  cursor: pointer;
  pointer-events: auto;
}

.play-button:hover {
  background: var(--text-primary);
  color: var(--bg-primary);
}

.play-icon {
  width: 48px;
  height: 48px;
  margin-left: 4px; /* Optically center triangle */
}

.play-text {
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.05em;
  color: var(--text-primary);
  margin: 0 0 8px 0;
  text-transform: lowercase;
}

.play-subtext {
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-weight: 500;
  margin: 0;
  padding: 4px 12px;
  border: 1px solid var(--border-color);
  background: transparent;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* PLAYER CONTAINER */
.player-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  background: #000;
}

.player-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);
  z-index: 10;
}

.player-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.player-title {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.1rem;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.player-meta {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-weight: 500;
}

.player-controls {
  display: flex;
  align-items: center;
  gap: 20px;
}

.source-selector {
  display: flex;
  background: transparent;
  padding: 4px;
  border: 1px solid var(--border-color);
  gap: 4px;
}

.source-btn {
  background: transparent;
  color: var(--text-secondary);
  border: none;
  padding: 6px 16px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.source-btn:hover {
  color: var(--text-primary);
}

.source-btn.active {
  background: var(--text-primary);
  color: var(--bg-primary);
}

.close-btn {
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.close-btn:hover {
  background: var(--text-primary);
  color: var(--bg-primary);
  border-color: var(--text-primary);
}

.close-icon {
  width: 20px;
  height: 20px;
}

/* IFRAME / VIDEO WRAPPER */
.iframe-container {
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  background: #000;
  min-height: 400px;
}

.video-iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
  background: #000;
}

/* OVERLAYS (Loading, Error) */
.overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 5;
}

.loader-circle {
  width: 48px;
  height: 48px;
  border: 2px solid var(--border-color);
  border-top-color: var(--text-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.overlay-text {
  color: var(--text-primary);
  font-weight: 500;
  letter-spacing: 0.05em;
  font-size: 0.9rem;
  text-transform: uppercase;
}

.error-overlay h3 {
  color: var(--text-primary);
  margin: 16px 0 8px;
  font-size: 1.25rem;
}

.error-overlay p {
  color: var(--text-secondary);
  margin-bottom: 24px;
}

.error-icon {
  width: 64px;
  height: 64px;
  color: var(--text-primary);
}

.retry-btn {
  background: transparent;
  color: var(--text-primary);
  border: 1px solid var(--text-primary);
  padding: 10px 24px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.retry-btn:hover {
  background: var(--text-primary);
  color: var(--bg-primary);
}

/* SOURCE INFO TOAST */
.source-info {
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
  pointer-events: none;
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes slideUp {
  from { opacity: 0; transform: translate(-50%, 20px); }
  to { opacity: 1; transform: translate(-50%, 0); }
}

.source-alert {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  padding: 10px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.info-icon {
  width: 20px;
  height: 20px;
  color: var(--text-primary);
}

.info-text {
  color: var(--text-primary);
  font-size: 0.85rem;
}

.info-text strong {
  font-weight: 600;
}

/* RESPONSIVE DESIGN */
@media (max-width: 768px) {
  .player-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    padding: 16px;
  }
  
  .player-controls {
    width: 100%;
    justify-content: space-between;
  }
  
  .source-selector {
    flex-wrap: nowrap;
    overflow-x: auto;
    width: calc(100% - 48px);
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }
  
  .source-selector::-webkit-scrollbar {
    display: none;
  }
  
  .source-btn {
    flex-shrink: 0;
  }
  
  .play-button {
    width: 64px;
    height: 64px;
  }
  
  .play-icon {
    width: 32px;
    height: 32px;
  }
  
  .source-info {
    bottom: 12px;
    width: calc(100% - 24px);
  }
  
  .source-alert {
    width: 100%;
  }
}
</style>
