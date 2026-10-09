# Art Explorer

A small, gallery-style browser for the [Art Institute of Chicago](https://www.artic.edu/)'s public collection, built with SvelteKit and Svelte 5 runes.

**Live:** _add your Vercel URL here_

## Features

- **Top Art:** a masonry grid of the museum's highlighted works, with blur-up image loading
- **Search:** a floating glass search bar with debounced input. The query and page live in the URL, so results are shareable and the back button works.
- **Detail view:** a large image, metadata and description, with a back link that returns to the exact search you came from
- **Favorites:** save works with the heart button. They persist in `localStorage`, and the count shows in the menu.
- **Header:** a glass menu with curated collections, plus the live time and weather in Chicago
- **States:** skeleton loading, empty results, API errors with retry, missing images and a 404 page
- **Motion:** View Transitions morph a card into its detail page, and all motion respects `prefers-reduced-motion`

## APIs

| API | Used for |
| --- | --- |
| [Art Institute of Chicago API](https://api.artic.edu/docs/) (no key) | Artworks, search and detail. Images come from its IIIF server. |
| [Open-Meteo](https://open-meteo.com/) (no key) | Current weather in Chicago for the header |

All requests live in [`src/lib/api.js`](src/lib/api.js).

## How it's built

```
src/
  app.css                       design tokens (color, type, space, radius, shadow) and base styles
  lib/
    api.js                      every fetch, plus response shaping
    stores/favorites.svelte.js  shared rune-based store ($state + $derived), persisted to localStorage
    components/                 Header, Menu, ChicagoNow, SearchBar, ArtworkGrid, ArtworkCard,
                                ArtImage, FavoriteButton, Skeleton, EmptyState, ErrorState
  routes/
    +layout.js / +layout.svelte header, weather, view transitions
    +page.js / +page.svelte     list and search (reads ?q= and ?page=)
    artwork/[id]/               detail view (404 for unknown ids)
    favorites/                  saved works
    +error.svelte               404 and error page
```

- **Data** is fetched in SvelteKit `load` functions, never in `onMount`.
- **State:** the URL holds search and page. A shared class with `$state` holds favorites. Components keep UI-only state locally, such as whether an image has loaded or the menu is open.
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
