# tampermonkey-seerr

Tampermonkey userscript for Seerr — the media request manager for the \*arr stack — that removes the `MOVIE` / `SERIES` pill badges overlaid on poster cards.

The pills are hidden everywhere poster cards appear — carousels, search results, and recommendations — while the green availability icon (available / requested) is left untouched.

## Install

1. Install [Tampermonkey](https://www.tampermonkey.net/) for your browser (Chrome, Firefox, Edge, or Safari).
2. Open the Tampermonkey dashboard → **Utilities** → **Import from file** and select `seerr-hide-media-type-badges.user.js` — or create a new script and paste its contents.
3. If your Seerr instance isn't at `overseerr.home`, edit the `@match` lines (see below).
4. Hard-refresh your Seerr tab.

## How it works

Two independent layers:

- **CSS** hides the pill immediately at `document-start` using Seerr's current class names, so it never flashes on load.
- **JS** watches for poster cards whose text is exactly `Movie` / `Series` and hides their pill container. It runs on load and on every DOM change, so it keeps working after UI restyles and SPA navigation.

The pill is hidden with `visibility: hidden` rather than `display: none` so it keeps its slot in the card's flex layout — that's what keeps the green status icon anchored to the top-right in both normal and hover states.

## Matching your instance

The script ships with `@match` pointing at `overseerr.home`:

```
// @match        http://overseerr.home/*
// @match        https://overseerr.home/*
```

Swap in whatever URL you use (e.g. `http://192.168.1.50:5055/*`).

## Compatibility

Tested against Seerr 3.5.1.
