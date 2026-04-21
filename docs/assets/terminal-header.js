// Inside the Black Box — shared terminal header logic
// Included by every page. Page-specific scripts (boot sequence,
// hover interactions, back-btn) live inline in each HTML file.

function toggleTheme() {
  const t = document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  document.body.setAttribute('data-theme', t);
  document.documentElement.setAttribute('data-theme', t);
}
