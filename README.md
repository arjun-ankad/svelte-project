# Art Explorer

A small, gallery-style browser for [The Metropolitan Museum of Art](https://www.metmuseum.org/)'s open-access collection, built with SvelteKit and Svelte 5 runes.

> An unofficial project. It is not affiliated with The Met.

**Live:** https://svelte-project.vercel.app/

## Features

- **Landing page:** an endless wall of the Met's highlighted paintings (about 420 from across the museum), each shown complete and uncropped. The order is reshuffled on every visit.
  - Every column moves at its own speed.
  - While you're idle, the page drifts slowly downward. Any scroll, tap or key press hands control straight back.
  - After the last highlight, the wall loops back to the first.
- **Ranked results:** searches and collections show the Met's best-known matches first: curator-picked highlighted paintings, then other highlights, then everything else.
- **Search:** a floating glass search bar with debounced input. The query lives in the URL, so results are shareable and the back button works. More results load automatically as you scroll.
- **Infinite loading:** if you scroll faster than the content loads, a spinner appears where a column runs out. Failed requests retry quietly in the background, with increasing waits between attempts, until they succeed.
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

- **Search returns only object ids, and object requests can be slow** (2–25 seconds each at busy times). The `Feed` class (`src/lib/feed.svelte.js`) fetches objects 10 at a time and adds each artwork the moment it arrives, so one slow request never holds up the page.
- **The API has no popularity data.** Curator-flagged highlights stand in for it. Each search fetches its highlighted paintings and other highlights as two full id lists (one request each), puts them first, and skips them when they reappear in the general results.
- **Many matching works have no open-access image.** `getArtworks` walks through the results until it has a full page of works with images (at most 2 batches), then returns a cursor for Load more.
- **The API blocks bursts of more than about 70 requests.** For that reason:
  - The app renders in the browser (`ssr = false`), so requests come from each visitor rather than from one shared server IP.
  - Every response is cached in memory, so going back to a list, opening a tile or looping the wall costs no extra requests.
  - A batch stops at the first failed request, so that artwork is retried later rather than skipped.

## How it's built

```
src/
  app.css                       design tokens (color, type, space, radius, shadow, glass) and base styles
  lib/
    api.js                      every fetch, plus caching and response shaping
    feed.svelte.js              Feed: rune-based class that fills a list progressively, with retry
    stores/favorites.svelte.js  shared rune-based store ($state + $derived), persisted to localStorage
    attachments/drift.js        per-column speeds and idle auto-scroll on the landing page
    attachments/nearViewport.js IntersectionObserver trigger for infinite loading
    components/                 Header, Menu, NewYorkNow, SearchBar, ArtworkGrid,
                                ArtworkCard, ArtImage, FavoriteButton, Skeleton, Spinner, EmptyState, ErrorState
  routes/
    +layout.js / +layout.svelte header, weather, view transitions
    +page.js / +page.svelte     highlights and search (reads ?q=)
    artwork/[id]/               detail view (404 for unknown ids)
    favorites/                  saved works
    +error.svelte               404 and error page
```

- **Data** is fetched in SvelteKit `load` functions. The list's `load` returns a `Feed` that starts fetching straight away, so skeletons show immediately and artworks fill in one by one.
- **State:**
  - The URL holds the search.
  - A shared class with `$state` holds favorites.
  - A `Feed` instance (`$state` fields) holds each list. The route's `load` creates it, and the page reads it reactively.
  - UI-only state stays local to its component, such as whether an image has loaded or the menu is open.
- **Masonry grid:** `ArtworkGrid` deals artworks into columns, and the column count is a `$derived` value from the container's bound width.
  - Each image finishing loading only moves the tiles below it, rather than reshuffling the whole layout as CSS columns would.
  - On the landing page, faster columns get proportionally more artworks, so none of them runs dry first.
- **Smooth drifting:** browsers scroll the window in whole pixels, which makes very slow scrolling step visibly. `drift` scrolls the window in whole pixels and covers the leftover fraction with a GPU transform on each column, so motion stays smooth.
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
