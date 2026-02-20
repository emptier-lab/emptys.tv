import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import App from "./App.vue";

// Import safe ad blocking CSS
import "./styles/adblocker.css";

// Views
import HomeView from "./views/HomeView.vue";
import MovieDetailView from "./views/MovieDetailView.vue";
import TVDetailView from "./views/TVDetailView.vue";
import WatchView from "./views/WatchView.vue";
import SearchView from "./views/SearchView.vue";
import MoviesView from "./views/MoviesView.vue";
import TVShowsView from "./views/TVShowsView.vue";
import TrendingView from "./views/TrendingView.vue";
import FavoritesView from "./views/FavoritesView.vue";
import WatchlistView from "./views/WatchlistView.vue";
import PersonDetailView from "./views/PersonDetailView.vue";
import NotFoundView from "./views/NotFoundView.vue";

// Router configuration
const routes = [
  {
    path: "/",
    name: "Home",
    component: HomeView,
  },
  {
    path: "/movies",
    name: "Movies",
    component: MoviesView,
  },
  {
    path: "/tv-shows",
    name: "TVShows",
    component: TVShowsView,
  },
  {
    path: "/trending",
    name: "Trending",
    component: TrendingView,
  },
  {
    path: "/search",
    name: "Search",
    component: SearchView,
  },
  {
    path: "/movie/:id",
    name: "MovieDetail",
    component: MovieDetailView,
    props: true,
  },
  {
    path: "/tv/:id",
    name: "TVDetail",
    component: TVDetailView,
    props: true,
  },
  {
    path: "/watch/:type/:id",
    name: "Watch",
    component: WatchView,
    props: true,
  },
  {
    path: "/watch/:type/:id/:season/:episode",
    name: "WatchEpisode",
    component: WatchView,
    props: true,
  },
  {
    path: "/favorites",
    name: "Favorites",
    component: FavoritesView,
  },
  {
    path: "/watchlist",
    name: "Watchlist",
    component: WatchlistView,
  },
  {
    path: "/person/:id",
    name: "PersonDetail",
    component: PersonDetailView,
    props: true,
  },

  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: NotFoundView,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
});

// Create and mount app
const app = createApp(App).use(router);

app.mount("#app");

import { adBlocker } from "./services/adblocker";
adBlocker.enable();
