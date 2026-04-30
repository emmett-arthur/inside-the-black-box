// Inside the Black Box — shared terminal header logic
// Included by every page. Page-specific scripts (boot sequence,
// hover interactions, back-btn) live inline in each HTML file.
// initReadTime(), initTOC(), and initAudioPlayer() auto-run at script load.

// ── SHARED PROMPT STATE ──────────────────────────────────────
// Coordinates between initTerms() and initAudioPlayer() so that
// dismissing a glossary term while audio plays restores "▸ playing"
// rather than silently reverting to idle.
const _promptState = { idle: null, playing: null };

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const t = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', t);
  document.body.setAttribute('data-theme', t);
  localStorage.setItem('bb_theme', t);
}

function initTerms() {
  const terms = document.querySelectorAll('.term[data-def]');
  const left  = document.querySelector('.terminal-prompt-bar .prompt-left');
  let activeEl = null;

  // Fallback snapshot in case _promptState.idle isn't set yet
  const idleHTML = left ? left.innerHTML : '';

  function showDef(el) {
    if (activeEl) activeEl.classList.remove('active');
    activeEl = el;
    el.classList.add('active');
    left.innerHTML =
      `<span class="p-muted">def&nbsp;</span>` +
      `<span class="p-file">${el.textContent}</span>` +
      `<span class="p-muted">&nbsp;→&nbsp;</span>` +
      `<span class="p-cmd">${el.dataset.def}</span>`;
  }

  function clearDef() {
    if (activeEl) activeEl.classList.remove('active');
    activeEl = null;
    // Restore playing state if audio is active, otherwise idle
    left.innerHTML = _promptState.playing ?? _promptState.idle ?? idleHTML;
  }

  terms.forEach(el => {
    el.addEventListener('click', e => {
      e.stopPropagation();
      if (activeEl === el) { clearDef(); return; }
      showDef(el);
    });
  });

  // Click anywhere else to dismiss
  document.addEventListener('click', () => { if (activeEl) clearDef(); });
}

// ── READ TIME ────────────────────────────────────────────────
// Counts words in <article>, calculates minutes at 250 wpm,
// and appends "~N min read" after the .p-file span.
// Must run before initTerms() so idleHTML captures the read time.
function initReadTime() {
  const article = document.querySelector('article');
  const pFile   = document.querySelector('.terminal-prompt-bar .p-file');
  if (!article || !pFile) return;

  const words = article.innerText.trim().split(/\s+/).filter(Boolean).length;
  const mins  = Math.max(1, Math.round(words / 250));

  const span = document.createElement('span');
  span.className   = 'p-read-time';
  span.textContent = '~' + mins + ' min read';
  pFile.insertAdjacentElement('afterend', span);

  // Save idle snapshot after read time is appended
  const left = document.querySelector('.terminal-prompt-bar .prompt-left');
  if (left) _promptState.idle = left.innerHTML;
}

// ── TABLE OF CONTENTS SIDEBAR ────────────────────────────────
// Builds a fixed left sidebar from <article> h2 elements.
// Only shown when the article has 3+ h2 headings.
// Assigns slug IDs to headings that lack one.
function initTOC() {
  const article  = document.querySelector('article');
  if (!article) return;
  const headings = Array.from(article.querySelectorAll('h2'));
  if (headings.length < 3) return;

  // Slugify heading text (strips punctuation, collapses whitespace)
  function slugify(text) {
    return text.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // Assign unique IDs where missing; add scroll offset for fixed header
  const usedIds = new Set(
    Array.from(document.querySelectorAll('[id]')).map(el => el.id)
  );
  headings.forEach(h => {
    if (!h.id) {
      let base = slugify(h.textContent.trim());
      let id   = base;
      let n    = 1;
      while (usedIds.has(id)) { id = base + '-' + (++n); }
      h.id = id;
      usedIds.add(id);
    }
    h.style.scrollMarginTop = '112px'; // clears fixed terminal header
  });

  // Build sidebar DOM
  const nav = document.createElement('nav');
  nav.className = 'toc-sidebar';
  nav.id        = 'toc-sidebar';
  nav.setAttribute('aria-label', 'Table of contents');

  const rule = document.createElement('hr');
  rule.className = 'toc-rule';
  nav.appendChild(rule);

  const ul = document.createElement('ul');
  headings.forEach(h => {
    const li = document.createElement('li');
    const a  = document.createElement('a');
    a.href      = '#' + h.id;
    a.className = 'toc-link';
    a.textContent = h.textContent.trim();
    li.appendChild(a);
    ul.appendChild(li);
  });
  nav.appendChild(ul);
  document.body.appendChild(nav);

  // Highlight active section via IntersectionObserver
  const links = Array.from(nav.querySelectorAll('.toc-link'));
  let activeLink = null;

  function setActive(link) {
    if (activeLink) activeLink.classList.remove('active');
    activeLink = link;
    if (activeLink) activeLink.classList.add('active');
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const idx = headings.indexOf(entry.target);
      if (idx !== -1) setActive(links[idx]);
    });
  }, { rootMargin: '-10% 0px -80% 0px' });

  headings.forEach(h => observer.observe(h));
}

// ── AUDIO PLAYER ─────────────────────────────────────────────
// Renders a slim player between the lede and first h2.
// Does nothing if no .lede exists (index page) or if the audio
// file returns a non-200 response (404 guard).
function initAudioPlayer() {
  const lede = document.querySelector('article .lede');
  if (!lede) return;

  const titleText = document.querySelector('.titlebar-center')?.textContent?.trim() || '';
  const slug = titleText.replace(/\.md$/, '');
  if (!slug || slug === 'black_box.sh') return;

  const audioUrl = `audio/${slug}.mp3`;

  fetch(audioUrl, { method: 'HEAD' })
    .then(res => { if (res.ok) _buildPlayer(slug, audioUrl, lede); })
    .catch(() => {});
}

function _buildPlayer(slug, audioUrl, lede) {
  const audio = new Audio(audioUrl);
  audio.preload = 'metadata';

  // ── DOM ──
  const player = document.createElement('div');
  player.className = 'audio-player';
  player.innerHTML =
    `<button class="audio-play-btn" aria-label="Play">▶</button>` +
    `<div class="audio-scrubber-wrap">` +
      `<input class="audio-scrubber" type="range" min="0" value="0" step="0.01">` +
    `</div>` +
    `<span class="audio-time">` +
      `<span class="audio-current">0:00</span>` +
      `<span class="audio-sep"> / </span>` +
      `<span class="audio-duration">--:--</span>` +
    `</span>`;
  lede.insertAdjacentElement('afterend', player);

  const btn      = player.querySelector('.audio-play-btn');
  const scrubber = player.querySelector('.audio-scrubber');
  const current  = player.querySelector('.audio-current');
  const duration = player.querySelector('.audio-duration');
  const left     = document.querySelector('.terminal-prompt-bar .prompt-left');

  function fmt(s) {
    const m   = Math.floor(s / 60);
    const sec = Math.floor(s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  }

  function setProgress(pct) {
    scrubber.style.setProperty('--pct', pct + '%');
  }

  // ── METADATA ──
  audio.addEventListener('loadedmetadata', () => {
    scrubber.max = audio.duration;
    duration.textContent = fmt(audio.duration);
  });

  // ── PLAY / PAUSE ──
  btn.addEventListener('click', () => {
    if (audio.paused) {
      audio.play();
      btn.textContent = '⏸';
      btn.setAttribute('aria-label', 'Pause');
      const playingHTML =
        `<span class="p-muted">▸&nbsp;</span>` +
        `<span class="p-file">playing&nbsp;</span>` +
        `<span class="p-cmd">${slug}.mp3</span>`;
      _promptState.playing = playingHTML;
      if (left) left.innerHTML = playingHTML;
    } else {
      audio.pause();
    }
  });

  audio.addEventListener('pause', () => {
    btn.textContent = '▶';
    btn.setAttribute('aria-label', 'Play');
    _promptState.playing = null;
    if (left) left.innerHTML = _promptState.idle ?? '';
  });

  audio.addEventListener('ended', () => {
    btn.textContent = '▶';
    btn.setAttribute('aria-label', 'Play');
    _promptState.playing = null;
    setProgress(0);
    scrubber.value = 0;
    current.textContent = '0:00';
    if (left) left.innerHTML = _promptState.idle ?? '';
  });

  // ── SCRUBBER SYNC ──
  audio.addEventListener('timeupdate', () => {
    if (!audio.duration) return;
    scrubber.value = audio.currentTime;
    current.textContent = fmt(audio.currentTime);
    setProgress((audio.currentTime / audio.duration) * 100);
  });

  scrubber.addEventListener('input', () => {
    audio.currentTime = +scrubber.value;
    current.textContent = fmt(+scrubber.value);
    setProgress((+scrubber.value / audio.duration) * 100);
  });
}

// Auto-initialise on every page that includes this script.
// Order matters: initReadTime must run before initTerms() (called by
// each article's inline script) so the idleHTML snapshot includes read time.
initReadTime();
initTOC();
initAudioPlayer();
