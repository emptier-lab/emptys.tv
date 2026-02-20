<template>
  <div class="side-notifications">
    <transition-group name="notification" tag="div" class="notifications-list">
      <div
        v-for="notification in visibleNotifications"
        :key="notification.id"
        class="notification-toast"
        :class="[`notification-toast--${notification.type}`]"
        @click="handleNotificationClick(notification)"
      >
        <div class="notification-content">
          <div class="notification-icon" v-html="getNotificationIcon(notification.type)"></div>
          <div class="notification-text">
            <div class="notification-message">{{ notification.message }}</div>
            <div class="notification-time">{{ formatTimeAgo(notification.timestamp) }}</div>
          </div>
          <div class="notification-actions">
            <button
              v-if="notification.actionPath"
              class="action-btn text-btn"
              @click.stop="handleAction(notification)"
            >
              View
            </button>
            <button
              class="action-btn icon-btn"
              @click.stop="dismissNotification(notification.id)"
              aria-label="Dismiss"
            >
              <svg viewBox="0 0 24 24" class="icon" width="16" height="16"><path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg>
            </button>
          </div>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { localStorageService } from '@/services/localStorage'

export default {
  name: 'SideNotifications',
  setup() {
    const router = useRouter()
    const notifications = ref([])
    const checkInterval = ref(null)
    const REMINDER_CHECK_INTERVAL = 60000 // Check every minute
    const MAX_VISIBLE_NOTIFICATIONS = 5

    // Load notifications from localStorage
    const loadNotifications = () => {
      notifications.value = localStorageService.getNotifications()
    }

    // Get only unread notifications for display
    const visibleNotifications = computed(() => {
      return notifications.value
        .filter(n => !n.read)
        .slice(0, MAX_VISIBLE_NOTIFICATIONS)
    })

    // Check for watchlist reminders and create notifications
    const checkForWatchlistReminders = () => {
      const reminders = localStorageService.getWatchlistReminders()

      reminders.forEach(item => {
        const message = `Time to watch "${item.title || item.name}"!`

        const notification = localStorageService.addNotification(
          message,
          'reminder',
          0
        )

        if (notification) {
          notification.actionPath = `/${item.media_type}/${item.id}`
          localStorageService.markAsNotified(item.id, item.media_type)
          loadNotifications()
        }
      })
    }

    // Format time ago
    const formatTimeAgo = (dateString) => {
      const date = new Date(dateString)
      const now = new Date()
      const diffMs = now - date
      const diffSec = Math.floor(diffMs / 1000)
      const diffMin = Math.floor(diffSec / 60)
      const diffHour = Math.floor(diffMin / 60)
      const diffDay = Math.floor(diffHour / 24)

      if (diffDay > 0) {
        return diffDay === 1 ? '1d' : `${diffDay}d`
      } else if (diffHour > 0) {
        return `${diffHour}h`
      } else if (diffMin > 0) {
        return `${diffMin}m`
      } else {
        return 'now'
      }
    }

    // Get notification icon based on type (SVG string)
    const getNotificationIcon = (type) => {
      switch (type) {
        case 'error':
          return '<svg viewBox="0 0 24 24" class="icon"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>';
        case 'warning':
          return '<svg viewBox="0 0 24 24" class="icon"><path fill="currentColor" d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>';
        case 'success':
           return '<svg viewBox="0 0 24 24" class="icon"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>';
        case 'reminder':
           return '<svg viewBox="0 0 24 24" class="icon"><path fill="currentColor" d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7v-5z"/></svg>'
        default:
          return '<svg viewBox="0 0 24 24" class="icon"><path fill="currentColor" d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>'
      }
    }

    // Handle notification click
    const handleNotificationClick = (notification) => {
      markNotificationAsRead(notification.id)
    }

    // Handle notification action
    const handleAction = (notification) => {
      if (notification.actionPath) {
        router.push(notification.actionPath)
      }
      markNotificationAsRead(notification.id)
    }

    // Mark notification as read
    const markNotificationAsRead = (id) => {
      localStorageService.markNotificationAsRead(id)
      loadNotifications()
    }

    // Dismiss notification
    const dismissNotification = (id) => {
      notifications.value = notifications.value.filter(n => n.id !== id)
      const allNotifications = localStorageService.getNotifications()
      const updatedNotifications = allNotifications.filter(n => n.id !== id)
      localStorage.setItem('empty-tv-notifications', JSON.stringify(updatedNotifications))
      loadNotifications()
    }

    // Start periodic reminder check
    const startReminderCheck = () => {
      checkForWatchlistReminders()
      checkInterval.value = setInterval(() => {
        checkForWatchlistReminders()
      }, REMINDER_CHECK_INTERVAL)
    }

    // Stop reminder check
    const stopReminderCheck = () => {
      if (checkInterval.value) {
        clearInterval(checkInterval.value)
      }
    }

    // Handle storage events from other tabs
    const handleStorageChange = (event) => {
      if (event.key === 'empty-tv-notifications' || event.key === 'empty-tv-watchlist') {
        loadNotifications()
      }
    }

    onMounted(() => {
      loadNotifications()
      startReminderCheck()
      window.addEventListener('storage', handleStorageChange)
    })

    onBeforeUnmount(() => {
      stopReminderCheck()
      window.removeEventListener('storage', handleStorageChange)
    })

    return {
      visibleNotifications,
      formatTimeAgo,
      getNotificationIcon,
      handleNotificationClick,
      handleAction,
      dismissNotification
    }
  }
}
</script>

<style scoped>
.side-notifications {
  position: fixed;
  top: 100px;
  right: 20px;
  z-index: 1000;
  pointer-events: none;
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 400px;
}

.notification-toast {
  background: rgba(26, 29, 41, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.05); /* Softer border */
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  pointer-events: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  max-width: 380px;
  min-width: 320px;
}

.notification-toast:hover {
  transform: translateX(-8px);
  border-color: rgba(255, 255, 255, 0.15); /* Slightly brighter on hover */
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
}

.notification-toast--error {
  border-left: 4px solid #ff6b6b;
}

.notification-toast--warning {
  border-left: 4px solid #ffd43b;
}

.notification-toast--success {
  border-left: 4px solid #00D4AA; /* Match brand success color */
}

.notification-toast--reminder {
  border-left: 4px solid #6C5CE7; /* Match brand secondary color */
}

.notification-toast--info {
  border-left: 4px solid #00D4AA; /* Match brand primary color */
}

.notification-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.notification-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.8);
}

.notification-icon :deep(svg) {
  width: 100%;
  height: 100%;
}

.notification-text {
  flex: 1;
  min-width: 0;
}

.notification-message {
  color: var(--text-primary);
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.4;
  margin-bottom: 4px;
  word-wrap: break-word;
}

.notification-time {
  color: var(--text-secondary);
  font-size: 0.75rem;
}

.notification-actions {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 4px;
}

.action-btn {
  background: transparent;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
}

.text-btn {
  font-size: 0.8rem;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 4px;
}

.text-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.icon-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  color: var(--text-secondary);
}

.icon-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

/* Transition animations */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.8);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.8);
}

.notification-move {
  transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

@media (max-width: 768px) {
  .side-notifications {
    top: 80px;
    right: 16px;
    left: 16px;
  }

  .notifications-list {
    max-width: none;
  }

  .notification-toast {
    min-width: auto;
    max-width: none;
  }

  .notification-content {
    gap: 8px;
  }

  .notification-message {
    font-size: 0.8rem;
  }
}
</style>
