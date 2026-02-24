// Enhanced Ad Blocker Service with Anti-Porn and Popup Protection
// Specifically designed for video streaming sites with aggressive ads

class EnhancedAdBlocker {
  constructor() {
    this.enabled = false;
    this.blockedCount = 0;
    this.popupCount = 0;
    this.initialized = false;
    this.redirectCount = 0;

    // Enhanced filter lists for video streaming sites
    this.adDomains = new Set([
      // Porn/Adult ad networks
      "pornhub.com",
      "xnxx.com",
      "xvideos.com",
      "redtube.com",
      "tube8.com",
      "spankbang.com",
      "chaturbate.com",
      "cam4.com",
      "livejasmin.com",
      "bongacams.com",
      "stripchat.com",
      "camsoda.com",
      "myfreecams.com",

      // Adult dating/hookup ads
      "adultfriendfinder.com",
      "ashley-madison.com",
      "benaughty.com",
      "flirt.com",
      "fuckbook.com",
      "meetme.com",
      "zoosk.com",

      // Common ad networks
      "doubleclick.net",
      "googlesyndication.com",
      "googleadservices.com",
      "amazon-adsystem.com",
      "adsystem.amazon.com",
      "googletagmanager.com",
      "facebook.com/tr",
      "connect.facebook.net",
      "analytics.google.com",
      "google-analytics.com",
      "scorecardresearch.com",
      "quantserve.com",

      // Video ad networks
      "vast.com",
      "vpaid.com",
      "adskeeper.co.uk",
      "propellerads.com",
      "revcontent.com",
      "taboola.com",
      "outbrain.com",
      "mgid.com",
      "adnxs.com",
      "adsystem.com",
      "advertising.com",
      "adsymptotic.com",

      // Popup/redirect networks
      "popads.net",
      "popcash.net",
      "clicksor.com",
      "exitjunction.com",
      "juicyads.com",
      "exoclick.com",
      "trafficjunky.net",
      "eroAdvertising.com",
      "adsterra.com",
      "hilltopads.net",
      "clickaine.com",
      "adcash.com",

      // Crypto/scam ads
      "coinbase.com/join",
      "binance.com/register",
      "crypto.com/app",
      "bitcoin.com",
      "blockchain.com",
      "coindesk.com",

      // Malware/suspicious
      "malware.com",
      "virus.com",
      "trojan.com",
      "spyware.com",
      "adware.com",
      "suspicious.com",
      "phishing.com",
    ]);

    // Enhanced URL patterns for blocking
    this.adPatterns = [
      // Porn/adult patterns
      /porn|xxx|sex|adult|nude|naked|fuck|dick|pussy|tits|ass|cum|anal/i,
      /dating|hookup|milf|teen|mature|webcam|cam|live|chat/i,
      /casino|poker|gambling|bet|lottery|prize|winner|congratulations/i,

      // Ad patterns
      /\/ads\/|\/ad\/|\/advertisement\/|\/advert\/|\/banner\/|\/popup\//i,
      /\/sponsored\/|\/promotion\/|\/promo\/|\/offer\/|\/deal\//i,
      /\.ads\.|\.ad\.|advertisement|googleads|facebook.*ads/i,

      // Popup patterns
      /popup|pop-up|popunder|pop-under|overlay|modal.*ad/i,
      /redirect|forward|click.*here|download.*now|install.*now/i,
      /win.*prize|you.*won|claim.*now|limited.*time/i,

      // Video ad patterns
      /preroll|midroll|postroll|vast|vpaid|ima.*ad/i,
      /videojs.*ad|jwplayer.*ad|player.*ad|stream.*ad/i,
    ];

    // CSS selectors for aggressive element removal
    this.adSelectors = [
      // Generic ad containers
      ".ad",
      ".ads",
      ".advertisement",
      ".sponsored",
      ".promotion",
      '[id*="ad"]',
      '[id*="ads"]',
      '[class*="ad"]',
      '[class*="ads"]',
      '[id*="banner"]',
      '[class*="banner"]',
      '[id*="popup"]',
      '[class*="popup"]',

      // Video player ads
      ".video-ads",
      ".player-ads",
      ".preroll",
      ".midroll",
      ".postroll",
      ".vast-ad",
      ".vpaid-ad",
      ".ima-ad",
      ".jwplayer-ad",
      ".videojs-ad",

      // Overlay/popup ads
      ".overlay-ad",
      ".modal-ad",
      ".popup-ad",
      ".floating-ad",
      ".sticky-ad",
      ".fixed-ad",
      ".absolute-ad",
      ".interstitial",

      // Social media tracking
      ".fb-like",
      ".twitter-follow",
      ".social-share",
      ".social-plugin",

      // Adult/porn specific
      '[href*="porn"]',
      '[href*="xxx"]',
      '[href*="adult"]',
      '[href*="sex"]',
      '[src*="porn"]',
      '[src*="xxx"]',
      '[src*="adult"]',
      '[src*="sex"]',

      // Common ad networks
      "ins.adsbygoogle",
      ".adsbygoogle",
      "[data-ad-client]",
      "[data-ad-slot]",
      ".amazon-ad",
      ".facebook-ad",
      ".google-ad",
      ".outbrain",
      ".taboola",
    ];

  }

  async initialize() {
    if (!this.enabled || this.initialized) return;
    this.initialized = true;

    const setup = () => {
      if (document.body && document.getElementById('app')) {
        this.setupBlocking();
      } else {
        setTimeout(setup, 200);
      }
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", setup);
    } else {
      setup();
    }
  }

  setupBlocking() {
    // Block network requests
    this.setupNetworkBlocking();

    // Block DOM elements
    this.setupDOMBlocking();

    // Block popups
    this.setupPopupBlocking();

    // Setup iframe protection
    this.setupIframeProtection();

    // Continuous cleanup (less aggressive)
    this.startContinuousCleanup();

    // Block redirects
    this.setupRedirectBlocking();

  }

  setupNetworkBlocking() {
    // Only block obvious ad networks, not API calls

    // Don't override fetch or XHR - too risky for app functionality
    // Instead, rely on CSS blocking and DOM manipulation

    // Only block script loading from known ad networks
    const originalAppendChild = Node.prototype.appendChild;
    Node.prototype.appendChild = function (child) {
      if (
        child &&
        child.tagName === "SCRIPT" &&
        child.src &&
        window.adBlocker?.isKnownAdNetwork(child.src)
      ) {
        window.adBlocker.blockedCount++;
        return child;
      }
      return originalAppendChild.call(this, child);
    };
  }

  setupDOMBlocking() {
    if (!document.body) return;

    const appRoot = document.getElementById('app');
    const removeAds = () => {
      this.adSelectors.forEach((selector) => {
        try {
          document.querySelectorAll(selector).forEach((el) => {
            if (el && el.parentNode && !appRoot?.contains(el)) {
              el.remove();
              this.blockedCount++;
            }
          });
        } catch (e) { }
      });
    };

    removeAds();

    const observer = new MutationObserver(() => removeAds());
    observer.observe(document.body, { childList: true, subtree: true });
  }

  setupPopupBlocking() {
    // Block window.open
    const originalOpen = window.open;
    window.open = (...args) => {
      this.popupCount++;
      return null;
    };

    // Block all click events that might trigger popups
    document.addEventListener(
      "click",
      (e) => {
        const target = e.target;
        const href = target.href || target.closest("a")?.href;

        if (href && this.shouldBlockURL(href)) {
          e.preventDefault();
          e.stopPropagation();
          this.blockedCount++;
        }
      },
      true,
    );

    // Block focus/blur popup tricks
    let lastFocus = Date.now();
    window.addEventListener("blur", () => {
      const timeSinceFocus = Date.now() - lastFocus;
      if (timeSinceFocus < 1000) {
        window.focus();
        this.popupCount++;
      }
    });

    window.addEventListener("focus", () => {
      lastFocus = Date.now();
    });
  }

  setupIframeProtection() {
    // Monitor iframes for suspicious content
    const protectIframe = (iframe) => {
      try {
        iframe.addEventListener("load", () => {
          try {
            const iframeDoc =
              iframe.contentDocument || iframe.contentWindow?.document;
            if (iframeDoc) {
              // Remove ads from iframe content
              this.adSelectors.forEach((selector) => {
                const ads = iframeDoc.querySelectorAll(selector);
                ads.forEach((ad) => ad.remove());
              });
            }
          } catch (e) {
            // Cross-origin iframe, can't access content
          }
        });

        // Block suspicious iframe sources
        if (iframe.src && this.shouldBlockURL(iframe.src)) {
          iframe.src = "about:blank";
          this.blockedCount++;
        }
      } catch (e) {
      }
    };

    // Protect existing iframes
    document.querySelectorAll("iframe").forEach(protectIframe);

    // Protect new iframes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.tagName === "IFRAME") {
            protectIframe(node);
          }
          if (node.querySelectorAll) {
            node.querySelectorAll("iframe").forEach(protectIframe);
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  setupRedirectBlocking() {
    // Block location changes to suspicious URLs by monitoring location and beforeunload

    // Intercept beforeunload which fires when iframe attempts to redirect main window
    window.addEventListener('beforeunload', (e) => {
      // If we're on a page with a video player (e.g. /tv/ or /movie/ or /watch/), warn the user
      // so the browser automatically blocks the immediate background redirect.
      const isWatchPage = window.location.pathname.includes('/tv/') ||
        window.location.pathname.includes('/movie/') ||
        window.location.pathname.includes('/watch');

      if (document.querySelector('iframe.video-iframe') || isWatchPage) {
        e.preventDefault();
        e.returnValue = 'Are you sure you want to leave? (A popup may be trying to redirect you)';
        this.redirectCount++;
        return e.returnValue;
      }
    });

    const originalReplace = history.replaceState;
    history.replaceState = (...args) => {
      const url = args[2];
      if (url && this.shouldBlockURL(url)) {
        this.redirectCount++;
        return;
      }
      return originalReplace.apply(history, args);
    };

    const originalPushState = history.pushState;
    history.pushState = (...args) => {
      const url = args[2];
      if (url && this.shouldBlockURL(url)) {
        this.redirectCount++;
        return;
      }
      return originalPushState.apply(history, args);
    };

    // Location change monitoring to immediately stop suspicious redirects if beforeunload fails
    let lastLocation = window.location.href;
    setInterval(() => {
      if (window.location.href !== lastLocation) {
        if (this.shouldBlockURL(window.location.href)) {
          window.stop(); // Stop the loading immediately
          window.location.href = lastLocation; // Go back instantly
          this.redirectCount++;
          console.log("🚫 Blocked malicious location change to:", window.location.href);
        } else {
          lastLocation = window.location.href;
        }
      }
    }, 100);
  }

  startContinuousCleanup() {
    const appRoot = document.getElementById('app');
    setTimeout(() => {
      setInterval(() => {
        if (!this.enabled) return;

        this.adSelectors.forEach((selector) => {
          try {
            document.querySelectorAll(selector).forEach((el) => {
              if (!appRoot?.contains(el)) {
                el.remove();
                this.blockedCount++;
              }
            });
          } catch (e) { }
        });

        this.blockSuspiciousGlobals();
      }, 5000);
    }, 3000);
  }

  blockSuspiciousGlobals() {
    // Common ad/tracking globals to disable
    const suspiciousGlobals = [
      "googletag",
      "google_ad_client",
      "google_ad_slot",
      "fbq",
      "_fbq",
      "gtag",
      "ga",
      "_gaq",
      "pushly",
      "OneSignal",
      "webpushr",
      "popMagic",
      "popunder",
      "adngin",
    ];

    suspiciousGlobals.forEach((global) => {
      if (window[global]) {
        try {
          window[global] = undefined;
          delete window[global];
        } catch (e) {
          // Some globals are non-configurable
        }
      }
    });
  }

  shouldBlockURL(url) {
    if (!url || typeof url !== "string") return false;

    const urlLower = url.toLowerCase();

    // Don't block essential app URLs
    if (this.isEssentialURL(url)) {
      return false;
    }

    // Check domain blacklist
    for (const domain of this.adDomains) {
      if (urlLower.includes(domain)) {
        return true;
      }
    }

    // Check pattern blacklist
    for (const pattern of this.adPatterns) {
      if (pattern.test(url)) {
        return true;
      }
    }

    return false;
  }

  isEssentialURL(url) {
    if (!url) return false;
    const urlLower = url.toLowerCase();
    const essentials = [
      'localhost',
      '127.0.0.1',
      'themoviedb.org',
      'tmdb.org',
      'youtube.com/embed',
      'vimeo.com',
      'empty.tv'
    ];
    return essentials.some(essential => urlLower.includes(essential));
  }

  isKnownAdNetwork(url) {
    if (!url) return false;

    const urlLower = url.toLowerCase();

    // Only block obvious ad networks
    const knownAdNetworks = [
      "googleads",
      "googlesyndication",
      "doubleclick",
      "outbrain",
      "taboola",
      "popads",
      "exoclick",
      "propellerads",
      "revcontent",
      "mgid",
      "adnxs",
      "amazon-adsystem",
    ];

    return knownAdNetworks.some((network) => urlLower.includes(network));
  }

  containsSuspiciousContent(text) {
    const suspiciousTerms = [
      "click here",
      "download now",
      "install now",
      "update flash",
      "you have won",
      "congratulations",
      "claim your prize",
      "hot singles",
      "meet singles",
      "chat now",
      "cam girls",
      "xxx",
      "porn",
      "adult",
      "nude",
      "naked",
      "sex",
      "casino",
      "poker",
      "bet now",
      "lottery",
      "jackpot",
    ];

    return suspiciousTerms.some((term) => text.toLowerCase().includes(term));
  }

  getStats() {
    return {
      blocked: this.blockedCount,
      popups: this.popupCount,
      redirects: this.redirectCount,
      enabled: this.enabled,
    };
  }

  showStats() {
    const stats = this.getStats();
  }

  enable() {
    this.enabled = true;
    this.initialized = false;
    this.initialize();
  }

  disable() {
    this.enabled = false;
  }
}

export const adBlocker = new EnhancedAdBlocker();
window.adBlocker = adBlocker;

export default adBlocker;
