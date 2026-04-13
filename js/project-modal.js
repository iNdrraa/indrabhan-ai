(function () {
  'use strict';

  function esc(s) {
    if (s == null) return '';
    const d = document.createElement('div');
    d.textContent = String(s);
    return d.innerHTML;
  }

  let projectsById = {};
  let cache = null;
  let previousFocus = null;

  async function loadProjects() {
    if (cache) return cache;
    const res = await fetch('projects.json');
    if (!res.ok) throw new Error('Failed to load projects');
    cache = await res.json();
    projectsById = Object.fromEntries(cache.map((p) => [p.id, p]));
    return cache;
  }

  function ensureModalDom() {
    let root = document.getElementById('project-detail-modal');
    if (root) return root;
    root = document.createElement('div');
    root.id = 'project-detail-modal';
    root.className = 'fixed inset-0 z-[100] hidden';
    root.setAttribute('aria-hidden', 'true');
    root.innerHTML =
      '<div class="absolute inset-0 bg-black/70 backdrop-blur-sm" data-modal-backdrop></div>' +
      '<div class="relative z-10 flex min-h-full items-center justify-center p-4 md:p-8 pointer-events-none">' +
      '<div class="project-detail-panel pointer-events-auto max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-outline-variant/20 bg-surface-container-high shadow-[0_24px_80px_rgba(0,0,0,0.55)]" role="dialog" aria-modal="true" aria-labelledby="project-detail-title" tabindex="-1">' +
      '<div class="sticky top-0 z-10 flex justify-end border-b border-outline-variant/15 bg-surface-container-high/95 px-4 py-3 backdrop-blur-md">' +
      '<button type="button" class="flex h-10 w-10 items-center justify-center rounded-lg border border-outline-variant/30 text-on-surface-variant transition-colors hover:bg-surface-bright hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50" data-modal-close aria-label="Close project details">' +
      '<span class="material-symbols-outlined text-2xl">close</span></button></div>' +
      '<div class="project-detail-body px-6 pb-8 pt-2 md:px-10"></div></div></div>';
    document.body.appendChild(root);
    root.querySelector('[data-modal-backdrop]').addEventListener('click', close);
    root.querySelector('[data-modal-close]').addEventListener('click', close);
    return root;
  }

  function buildBody(p) {
    const displayTitle = p.galleryTitle || p.title;
    const img = p.images?.featured || p.images?.gallery || '';
    const imgAlt = p.imageAlt?.featured || p.imageAlt?.gallery || displayTitle;
    const catFeatured = p.category?.featured;
    const catGallery = p.category?.gallery;
    const tagSets = new Set([...(p.tags?.featured || []), ...(p.tags?.gallery || [])]);
    const tagsArr = [...tagSets];
    const tagsHtml = tagsArr
      .map(
        (t) =>
          `<span class="px-2.5 py-1 text-[10px] font-label uppercase tracking-wider bg-surface-bright text-on-surface-variant border border-outline-variant/25 rounded-full">${esc(t)}</span>`
      )
      .join('');

    let metricsBlock = '';
    if (p.metrics?.text) {
      metricsBlock =
        `<div class="mt-6 flex flex-wrap items-center gap-3 text-primary"><span class="material-symbols-outlined">${esc(p.metrics.icon || 'trending_up')}</span>` +
        `<span class="font-label text-sm font-bold">${esc(p.metrics.text)}</span></div>`;
    } else if (p.metrics?.stars != null) {
      metricsBlock = `<div class="mt-6 text-primary"><span class="font-label text-sm">${esc(String(p.metrics.stars))} / 5 user satisfaction</span></div>`;
    } else if (p.metrics?.percentage) {
      metricsBlock =
        `<div class="mt-6 inline-block bg-surface-bright px-4 py-2 rounded-lg"><span class="text-primary font-headline font-bold">${esc(p.metrics.percentage)}</span> ` +
        `<span class="text-[10px] uppercase font-label text-on-surface-variant">${esc(p.metrics.percentageText || '')}</span></div>`;
    }

    const metricsListHtml = (p.metricsList || [])
      .map(
        (m) =>
          `<li class="flex gap-2 text-sm text-on-surface-variant"><span class="material-symbols-outlined text-primary text-lg shrink-0">check_circle</span><span>${esc(m)}</span></li>`
      )
      .join('');

    const highlights =
      p.whatIDid && p.whatIDid.length
        ? `<div class="mt-8"><h4 class="font-headline font-bold text-lg text-on-surface mb-3">What I did</h4><ul class="space-y-3 list-none pl-0">${p.whatIDid
            .map(
              (line) =>
                `<li class="flex gap-3 text-sm text-on-surface-variant leading-relaxed"><span class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"></span><span>${esc(line)}</span></li>`
            )
            .join('')}</ul></div>`
        : '';

    const impact = p.featuredDescription
      ? `<p class="text-primary font-label text-sm font-semibold tracking-wide leading-relaxed">${esc(p.featuredDescription)}</p>`
      : '';

    const desc2 =
      p.galleryDescription && p.galleryDescription.trim() !== (p.description || '').trim()
        ? `<div class="mt-6"><h4 class="font-headline font-bold text-base text-on-surface mb-2">Deep dive</h4><p class="text-on-surface-variant text-sm leading-relaxed">${esc(p.galleryDescription)}</p></div>`
        : '';

    const overview = p.description
      ? `<div class="mt-4"><h4 class="font-headline font-bold text-base text-on-surface mb-2">Overview</h4><p class="text-on-surface-variant text-sm leading-relaxed">${esc(p.description)}</p></div>`
      : '';

    const catBadges = [catGallery, catFeatured].filter(Boolean).filter((c, i, a) => a.indexOf(c) === i);
    const catHtml = catBadges.length
      ? `<div class="flex flex-wrap gap-2 mt-3">${catBadges
          .map(
            (c) =>
              `<span class="text-[10px] font-label uppercase tracking-widest text-secondary border border-secondary/30 px-2 py-1 rounded">${esc(c)}</span>`
          )
          .join('')}</div>`
      : '';

    const imgBlock = img
      ? `<div class="mt-6 -mx-6 md:-mx-10 overflow-hidden border-y border-outline-variant/15"><img src="${esc(img)}" alt="${esc(imgAlt)}" class="w-full max-h-72 object-cover" loading="lazy" decoding="async" /></div>`
      : '';

    return (
      `<h2 id="project-detail-title" class="font-headline text-2xl md:text-3xl font-bold tracking-tight pr-4">${esc(displayTitle)}</h2>` +
      catHtml +
      imgBlock +
      (impact ? `<div class="mt-6">${impact}</div>` : '') +
      overview +
      desc2 +
      highlights +
      (metricsListHtml ? `<ul class="mt-6 space-y-2 list-none pl-0">${metricsListHtml}</ul>` : '') +
      metricsBlock +
      (tagsHtml ? `<div class="mt-8 flex flex-wrap gap-2 border-t border-outline-variant/15 pt-6">${tagsHtml}</div>` : '')
    );
  }

  async function open(idOrProject) {
    await loadProjects();
    const project = typeof idOrProject === 'string' ? projectsById[idOrProject] : idOrProject;
    if (!project) return;

    const root = ensureModalDom();
    root.querySelector('.project-detail-body').innerHTML = buildBody(project);
    root.classList.remove('hidden');
    root.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    previousFocus = document.activeElement;
    const panel = root.querySelector('.project-detail-panel');
    if (panel && typeof panel.focus === 'function') panel.focus();
  }

  function close() {
    const root = document.getElementById('project-detail-modal');
    if (!root || root.classList.contains('hidden')) return;
    root.classList.add('hidden');
    root.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (previousFocus && typeof previousFocus.focus === 'function') {
      try {
        previousFocus.focus();
      } catch (_) {}
    }
    previousFocus = null;
  }

  function onCardClick(e) {
    const card = e.target.closest('[data-project-id]');
    if (!card) return;
    const id = card.getAttribute('data-project-id');
    if (!id) return;
    e.preventDefault();
    open(id);
  }

  function onCardKeydown(e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const card = e.target.closest('[data-project-id]');
    if (!card || card !== e.target) return;
    if (e.key === ' ') e.preventDefault();
    const id = card.getAttribute('data-project-id');
    if (id) open(id);
  }

  document.addEventListener('DOMContentLoaded', () => {
    ensureModalDom();
    ['featured-projects-grid', 'gallery-grid'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('click', onCardClick);
        el.addEventListener('keydown', onCardKeydown);
      }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      const root = document.getElementById('project-detail-modal');
      if (root && !root.classList.contains('hidden')) {
        e.preventDefault();
        close();
      }
    });
  });

  window.ProjectDetail = { open, close, loadProjects };
})();
