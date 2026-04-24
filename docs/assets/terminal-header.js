// Inside the Black Box — shared terminal header logic
// Included by every page. Page-specific scripts (boot sequence,
// hover interactions, back-btn) live inline in each HTML file.
// initReadTime() and initTOC() auto-run at script load (bottom of <body>).

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

  // Save the original idle HTML so we can restore it
  const idleHTML = left.innerHTML;

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
    left.innerHTML = idleHTML;
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

// Auto-initialise on every page that includes this script.
// initReadTime must run before initTerms() (called by each article's
// inline script) so the idleHTML snapshot already includes read time.
initReadTime();
initTOC();
