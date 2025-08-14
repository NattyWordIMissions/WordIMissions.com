console.log('✅ loadSections.js is running!');

// ====================  assets/js/loadSections.js  ====================

/**
 * Helper that pulls a single section file and inserts it into <main#main-content>.
 */
async function loadSection(id, url) {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Could not load ${url}`);
  const html = await resp.text();
  document.getElementById('main-content').insertAdjacentHTML('beforeend', html);
}

/**
 * Load **all** five sections (welcome, natty, pixels, impressum, minigame)
 * and only *after* the last one is inserted do we import main.js.
 */
async function loadAllSections() {
  await loadSection('welcome',   'sections/welcome.html');
  await loadSection('natty',     'sections/natty.html');
  await loadSection('pixels',    'sections/pixels.html');
  await loadSection('bionik',     'sections/bionik.html');
  await loadSection('minigame',  'sections/minigame.html');
  await loadSection('impressum', 'sections/impressum.html');

}

/**
 * Run the loader and, when finished, load the script that does all the
 * animations / buttons / carousel etc.
 */
loadAllSections()
  .then(() => import('./main.js')   // <-- runs only AFTER sections exist
          .then(m => m.init()))          // <‑‑ call init
  .catch(err => console.error('Section‑loading error:', err));
