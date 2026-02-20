<template>
  <div class="lazy-grid-wrapper">
    <!-- Header slot for filters, titles, etc. -->
    <slot name="header"></slot>

    <!-- Actual visible items -->
    <div class="lazy-grid" :class="gridClass">
      <slot
        v-for="item in items"
        :key="getItemKey(item)"
        :item="item"
        name="item"
      ></slot>
    </div>

    <!-- Load more trigger when near bottom -->
    <div v-if="hasMoreContent" class="load-more-trigger" ref="loadMoreTrigger"></div>

    <!-- Loading indicator -->
    <div v-if="loading" class="lazy-grid-loading">
      <slot name="loading">
        <div class="minimal-loader">
          <div class="line-runner"></div>
        </div>
      </slot>
    </div>

    <!-- Empty state -->
    <div v-if="isEmpty" class="lazy-grid-empty">
      <slot name="empty">
        <div class="empty-state">
          <p>No items found.</p>
        </div>
      </slot>
    </div>

    <!-- Footer slot for pagination, load more, etc. -->
    <slot name="footer"></slot>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';

export default {
  name: 'LazyGrid',
  props: {
    items: {
      type: Array,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    },
    gridClass: {
      type: String,
      default: 'media-grid'
    },
    itemKey: {
      type: String,
      default: 'id'
    },
    loadMoreThreshold: {
      type: Number,
      default: 800
    },
    hasMoreContent: {
      type: Boolean,
      default: true
    }
  },
  emits: ['load-more'],
  setup(props, { emit }) {
    const loadMoreTrigger = ref(null);
    const observer = ref(null);
    let lastEmitTime = 0;

    const isEmpty = computed(() => {
      return props.items.length === 0 && !props.loading;
    });

    const getItemKey = (item) => {
      return item[props.itemKey] || JSON.stringify(item);
    };

    const setupObserver = () => {
      cleanupObserver();
      if (!window.IntersectionObserver || !loadMoreTrigger.value) return;

      observer.value = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && props.hasMoreContent && !props.loading) {
            const now = Date.now();
            if (now - lastEmitTime > 800) {
              lastEmitTime = now;
              emit('load-more');
            }
          }
        });
      }, {
        root: null,
        rootMargin: '1200px',
        threshold: 0
      });

      observer.value.observe(loadMoreTrigger.value);
    };

    const cleanupObserver = () => {
      if (observer.value) {
        observer.value.disconnect();
        observer.value = null;
      }
    };

    watch(() => props.hasMoreContent, (hasMore) => {
      nextTick(() => {
        if (hasMore) {
          setupObserver();
        } else {
          cleanupObserver();
        }
      });
    });

    watch(() => props.loading, (isLoading) => {
      if (!isLoading && props.hasMoreContent) {
        nextTick(() => setupObserver());
      }
    });

    onMounted(() => {
      nextTick(() => {
        if (props.hasMoreContent) {
          setupObserver();
        }
      });
    });

    onBeforeUnmount(() => {
      cleanupObserver();
    });

    return {
      loadMoreTrigger,
      isEmpty,
      getItemKey
    };
  }
};
</script>

<style scoped>
.lazy-grid-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.lazy-grid {
  width: 100%;
}

.load-more-trigger {
  width: 100%;
  height: 10px;
  pointer-events: none;
  margin-top: 1rem;
}

.lazy-grid-loading {
  display: flex;
  justify-content: center;
  padding: 4rem 0;
  width: 100%;
}

.minimal-loader {
  width: 120px;
  height: 1px;
  background: var(--border-color);
  position: relative;
  overflow: hidden;
}

.line-runner {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 30%;
  background: var(--text-primary);
  animation: runLine 1.5s cubic-bezier(0.65, 0, 0.35, 1) infinite;
}

@keyframes runLine {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(400%); }
}

.lazy-grid-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
  width: 100%;
  color: var(--text-secondary);
  font-family: var(--font-mono);
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
</style>
