const PATHS = {
  paw:'M5 14a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM19 14a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM9 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM15 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM12 13c-2.5 0-4.5 1.8-4.5 4 0 1.4 1.2 2 2.5 2h4c1.3 0 2.5-.6 2.5-2 0-2.2-2-4-4.5-4z',
  home:'M3 11l9-7 9 7M5 10v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9',
  health:'M3 12h4l2 5 4-10 2 5h6',
  list:'M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01',
  bell:'M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8M10 21a2 2 0 0 0 4 0',
  plus:'M12 5v14M5 12h14',
  edit:'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z',
  trash:'M4 7h16M10 11v6M14 11v6M5 7l1 13a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1l1-13M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3',
  x:'M18 6L6 18M6 6l12 12',
  check:'M5 12l5 5L20 7',
  chevron:'M6 9l6 6 6-6',
  download:'M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2',
  upload:'M12 21V9m0 0l-4 4m4-4l4 4M4 7V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2',
  calendar:'M4 7h16v13H4zM4 7V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2M8 3v4M16 3v4',
  camera:'M3 8a1 1 0 0 1 1-1h3l1.5-2h7L14 7h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1zM12 17a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z',
  syringe:'M14 4l6 6M16 6l-9.5 9.5L4 20l-1 1M9 11l3 3M12 8l3 3',
  pill:'M10.5 13.5l3-3M7 17a4 4 0 0 1 0-6l4-4a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-6 0z',
  scissors:'M6 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM6 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM8 8l12 8M8 16L20 8',
  flask:'M9 3h6M10 3v6l-5 9a1 1 0 0 0 1 1.5h12A1 1 0 0 0 19 18l-5-9V3M7 14h10',
  dog:'M10 5L8 4 6 6v3l-2 1v4l2 2v3h4v-3h4v3h4v-6l-2-2V7l-2-2-2 1z',
  user:'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 20a8 8 0 0 1 16 0',
  clock:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
  moon:'M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z',
  sun:'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4'
};
export function iconSprite() {
  return `<svg width="0" height="0" style="position:absolute" aria-hidden="true">${
    Object.entries(PATHS).map(([n,d]) =>
      `<symbol id="i-${n}" viewBox="0 0 24 24"><path d="${d}"/></symbol>`).join('')}</svg>`;
}
export function icon(name, cls='') {
  return `<svg class="icon ${cls}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
}
