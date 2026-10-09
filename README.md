# Art Explorer

A small, gallery-style browser for [The Metropolitan Museum of Art](https://www.metmuseum.org/)'s open-access collection, built with SvelteKit and Svelte 5 runes.

> An unofficial project. It is not affiliated with The Met.

**Live:** _add your Vercel URL here_

## Features

- **Landing page:** the Met's highlighted European paintings in a tight masonry grid, each shown complete and uncropped. While you're idle the page drifts slowly downward, and any scroll, tap or key press hands control straight back.
- **Search:** a floating glass search bar with debounced input. The query lives in the URL, so results are shareable and the back button works. Load more appends further results.
- **Detail view:** a large image and the full object record, with a back link that returns to the exact search you came from
- **Favorites:** save works with the heart button. They persist in `localStorage`, and the count shows in the menu.
- **Header:** pinned while you scroll. It holds a frosted-glass menu with Favorites and curated collections, plus the live time and weather in New York.
- **States:** skeleton loading, empty results, API errors with retry, missing images and a 404 page
- **Motion:** View Transitions morph a tile into its detail page, and all motion respects `prefers-reduced-motion`

## APIs

| API | Used for |
| --- | --- |
| [The Met Collection API](https://metmuseum.github.io/) (no key) | Search, object records and images |
| [Open-Meteo](https://open-meteo.com/) (no key) | Current weather in New York for the header |

All requests live in [`src/lib/api.js`](src/lib/api.js).

### Working with the Met API

- **Search returns only object ids.** Each page therefore fetches its objects separately, at most 6 at a time.
- **Many matching works have no open-access image.** `getArtworks` walks through the results until it has a full page of works with images (at most 2 batches), then returns a cursor for Load more.
- **The API blocks bursts of more than about 70 requests.** For that reason:
  - The app renders in the browser (`ssr = false`), so requests come from each visitor rather than from one shared server IP.
  - Every response is cached in memory, so going back to a list or opening a tile costs no extra requests.
  - A failed object leaves a gap in the grid instead of failing the page.

## How it's built

```
src/
  app.css                       design tokens (color, type, space, radius, shadow, glass) and base styles
  lib/
    api.js                      every fetch, plus caching and response shaping
    stores/favorites.svelte.js  shared rune-based store ($state + $derived), persisted to localStorage
    attachments/autoScroll.js   idle auto-scroll for the landing page ({@attach} factory)
    components/                 Header, Menu, NewYorkNow, SearchBar, ArtworkFeed, ArtworkGrid,
                                ArtworkCard, ArtImage, FavoriteButton, Skeleton, EmptyState, ErrorState
  routes/
    +layout.js / +layout.svelte header, weather, view transitions
    +page.js / +page.svelte     highlights and search (reads ?q=)
    artwork/[id]/               detail view (404 for unknown ids)
    favorites/                  saved works
    +error.svelte               404 and error page
```

- **Data** is fetched in SvelteKit `load` functions. The list's `load` returns its promise without awaiting it, so skeletons show immediately and `{#await}` fills them in.
- **State:**
  - The URL holds the search.
  - A shared class with `$state` holds favorites.
  - `ArtworkFeed` uses writable `$derived` values for Load more.
  - UI-only state stays local to its component, such as whether an image has loaded or the menu is open.
- **Masonry grid:** `ArtworkGrid` deals artworks into columns, and the column count is a `$derived` value from the container's bound width. Each image finishing loading only moves the tiles below it, rather than reshuffling the whole layout as CSS columns would.
- **Styling:** hand-written scoped CSS plus one tokens file. There are no UI libraries and no runtime dependencies.

## Run locally

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build (Vercel adapter)
npm run check     # svelte-check type and a11y diagnostics
```

## Deploy

The project uses `@sveltejs/adapter-vercel`. Push to GitHub, then import the repo at [vercel.com/new](https://vercel.com/new). No settings or environment variables are needed.

The Met logo belongs to The Metropolitan Museum of Art. Collection data and images are from the Met's Open Access program (CC0).
