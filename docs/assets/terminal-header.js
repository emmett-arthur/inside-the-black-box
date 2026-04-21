// Inside the Black Box — shared terminal header logic
// Included by every page. Page-specific scripts (boot sequence,
// hover interactions, back-btn) live inline in each HTML file.

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
