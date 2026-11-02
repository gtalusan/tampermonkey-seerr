// ==UserScript==
// @name         Seerr – Hide Movie/Series Badge on Posters
// @namespace    https://github.com/gtalusan/tampermonkey-seerr
// @version      1.0.0
// @description  Removes the MOVIE / SERIES pill overlaid on poster cards (carousels, search results, recommendations)
// @author       gtalusan
// @match        http://overseerr.home/*
// @match        https://overseerr.home/*
// @run-at       document-start
// ==/UserScript==

/*
 * Seerr overlays a small MOVIE / SERIES pill on the corner of every poster
 * card. This script hides it everywhere those cards appear — carousels,
 * search results, recommendations — while leaving the green availability
 * icon (available / requested) untouched.
 *
 * Two layers:
 *
 * 1) CSS — hides the pill instantly at document-start using Seerr's current
 *          class names, so it never flashes on load.
 *
 * 2) JS  — text-based fallback that finds elements whose entire text is
 *          "Movie" / "Series" inside a poster card and hides their pill
 *          container. This keeps working if Seerr restyles its UI, and
 *          catches cards added later by SPA navigation.
 *
 * Design notes:
 *
 * - No @grant APIs are used: the stylesheet is injected by hand, so the
 *   script runs identically in every Tampermonkey context, including Safari.
 *
 * - The pill is hidden with visibility rather than display so it keeps its
 *   slot in the card's flex layout. The status icon sits at the opposite
 *   end of a justify-between row, so preserving the pill's box is what
 *   keeps the icon pinned to the top-right in both normal and hover states.
 */

(function () {
  'use strict';

  // ---- Layer 1: instant CSS hide ----

  const css = `
    [data-testid="title-card"]
      div.absolute.left-0.right-0.flex.items-center.justify-between.p-2
      > div.pointer-events-none.z-40.self-start.rounded-full.border.shadow-md {
        visibility: hidden !important;
      }
  `;

  const addStyle = () => {
    const style = document.createElement('style');
    style.setAttribute('data-seerr-badge-hider', '');
    style.textContent = css;
    (document.head || document.documentElement).appendChild(style);
  };

  if (document.head) {
    addStyle();
  } else {
    // At document-start <head> may not exist yet; inject as soon as it appears.
    new MutationObserver((_, observer) => {
      if (document.head) {
        addStyle();
        observer.disconnect();
      }
    }).observe(document.documentElement, { childList: true, subtree: true });
  }

  // ---- Layer 2: text-based JS fallback ----

  const MEDIA_TEXT = /^(movies?|series|music)$/i;

  function hideBadges(root) {
    const cards = [];
    if (root.matches && root.matches('[data-testid="title-card"]')) cards.push(root);
    if (root.querySelectorAll) cards.push(...root.querySelectorAll('[data-testid="title-card"]'));

    for (const card of cards) {
      for (const el of card.querySelectorAll('div')) {
        if (el.children.length !== 0) continue;                  // text-only leaf
        if (!MEDIA_TEXT.test(el.textContent.trim())) continue;   // "Movie"/"Series"

        const pill =
          el.closest('div[class*="rounded-full"]') ||            // the badge pill
          (el.parentElement && el.parentElement.matches('div[class*="rounded-full"]')
            ? el.parentElement
            : null) ||
          el.parentElement ||                                    // any other wrapper
          el;

        pill.style.setProperty('visibility', 'hidden', 'important');
      }
    }
  }

  const scan = () => hideBadges(document);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scan, { once: true });
  } else {
    scan();
  }

  // SPA navigation: hide badges on any nodes added later.
  new MutationObserver((mutations) => {
    for (const m of mutations) {
      for (const n of m.addedNodes) {
        if (n.nodeType === Node.ELEMENT_NODE) hideBadges(n);
      }
    }
  }).observe(document.documentElement, { childList: true, subtree: true });

  console.log('[Seerr] media-type badge hider active');
})();
