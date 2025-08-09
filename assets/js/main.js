/* ───────────────────────  assets/js/main.js  ────────────────────────
   core JavaScript for the site (interactivity + animations)
   --------------*/

/* ────────────────────────────────────── 1.  Welcome section – build the words + shuffle/restore buttons ────────────────────────────────────── */
async function loadWelcome() {

  /* ────────────────────────────────────── 1.  Fetch welcome‑words from JSON, fall back to hard‑coded list ────────────────────────────────────── */
  let data;
  try {
    const res = await fetch('assets/data/welcome.json');
    data = await res.json();   // { words: [...] }
  } catch (_) {
    data = {
      words: [
        "Hello", " ","Welcome"," ", "to", " ","my", " ","Website"," ", "with","<br>", "my"," ",
        "NattyWordIMissions"," ", "and"," ", "the", " ","PixelsIVision"
      ]
    };
  }

  /* ────────────────────────────────────── 2.  Get the <section id="welcome"> that loadSections.js just inserted ────────────────────────────────────── */
  const section = document.getElementById('welcome');
  if (!section) {
    console.warn('Welcome section not found – loadWelcome aborted.');
    return;
  }

  /* ---- create a dedicated container for the headline (keeps controls intact) ---- */
  let headingContainer = section.querySelector('#welcome-heading');
  if (!headingContainer) {
    headingContainer = document.createElement('div');
    headingContainer.id = 'welcome-heading';
    section.insertBefore(headingContainer, section.firstChild);
  }

  /* ──────────────────────────────────────︎ 1️⃣  Build (or rebuild) the welcome headline ────────────────────────────────────── */
  function buildWelcomeHeadline() {
    /* 1️⃣  clear whatever headline was there before */
    headingContainer.innerHTML = '';
    const h1 = document.createElement('h1');

    /* 2️⃣  walk through the array that lives in welcome.json */
    data.words.forEach((w, i) => {
      if (w === '<br>') {
        /* the <br> token → real line‑break element */
        h1.appendChild(document.createElement('br'));
      } else {
        const span = document.createElement('span');
        span.textContent = w;          // plain word
        span.className   = 'word';
        h1.appendChild(span);
      }
    });

    /* 3️⃣  stick the headline into the heading container */
    headingContainer.appendChild(h1);
  }

  /* ---- build headline once ---- */
  buildWelcomeHeadline();

  /* ──────────────────────────────────────︎ 4.  Shuffle / restore controls ────────────────────────────────────── */
  const ctrl = document.createElement('div');
  ctrl.className = 'ctrl';

  const shuffleBtn = document.createElement('button');
  shuffleBtn.id    = 'shuffleBtn';
  shuffleBtn.textContent = 'Shuffle';

  const restoreBtn = document.createElement('button');
  restoreBtn.id    = 'restoreBtn';
  restoreBtn.textContent = 'Restore';

  ctrl.appendChild(shuffleBtn);
  ctrl.appendChild(restoreBtn);
  section.appendChild(ctrl);


// … inside loadWelcome() after you create the buttons you set its style i guess
shuffleBtn.classList.add('btn', 'btn-primary');
restoreBtn.classList.add('btn', 'btn-primary');
// anderer Style: restoreBtn.classList.add('btn', 'btn-secondary');

  /* ──────────────────────────────────────︎ 5.  Animate the words (fade‑in on load) ────────────────────────────────────── */
  const words = headingContainer.querySelectorAll('.word');
  words.forEach((w, i) => setTimeout(() => w.classList.add('show'), i * 200));

  /* ──────────────────────────────────────︎ 6.  Shuffle / restore logic ────────────────────────────────────── */
  const shuffleString = s => {
    const arr = s.split('');
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join('');
  };

// -------------------------------------------------------------------
// Shuffle button – query words each time it is pressed
shuffleBtn.addEventListener('click', () => {
  // fresh list of words for the *current* headline
  const words = headingContainer.querySelectorAll('.word');
  words.forEach((w, i) => {
    w.style.transitionDelay = `${i * 100}ms`;
    w.textContent = shuffleString(w.textContent);
    w.classList.remove('show');
    setTimeout(() => w.classList.add('show'), i * 100 + 50);
  });
});


  restoreBtn.addEventListener('click', () => {
    /* Re‑build headline – this will convert "<br>" into a real line‑break element */
    buildWelcomeHeadline();

    /* Re‑select the newly created .word nodes */
    const newWords = headingContainer.querySelectorAll('.word');
    newWords.forEach((w, i) => {
      w.style.transitionDelay = `${i * 100}ms`;
      w.classList.remove('show');
      setTimeout(() => w.classList.add('show'), i * 100 + 50);
    });
  });
}

/* ────────────────────────────────────── 2.  Sidebar navigation – smooth scrolling ────────────────────────────────────── */
function initSidebar() {
  document.querySelectorAll('#sidebar button[data-target]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.querySelector(btn.dataset.target);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

/* ────────────────────────────────────── 3.  Load intro‑text files (used by the .intro containers in the section files – not called automatically, but kept for future use) ────────────────────────────────────── */
// 3.  Load intro‑text files and make them a carousel item
function loadIntroText(section) {
  const container = section.querySelector('.intro');
  if (!container) return;        // no intro container → nothing to do

  const src = container.dataset.src;   // e.g. "assets/data/natty_intro.txt"
  fetch(src)
    .then(resp => {
      if (!resp.ok) throw new Error(`Failed to load ${src}`);
      return resp.text();
    })
    .then(text => {
      /* ---------- create a carousel item that holds the text ---------- */
      const carousel = section.querySelector('.carousel');
      if (!carousel) return;          // no carousel in this section

      const inner = carousel.querySelector('.inner');

      // create the item element
      const introItem = document.createElement('div');
      introItem.className = 'item intro-item';   // uses the CSS we just added
      introItem.innerHTML = text.replace(/\n/g, '<br>');

      // insert it **before** the first real slide
      inner.insertBefore(introItem, inner.firstChild);

      /* ----------  optional: make it fade‑in after the page loads ---------- */
      setTimeout(() => introItem.classList.add('show'), 300); // 0.3 s delay
    })
    .catch(err => {
      console.error(err);
      container.textContent = 'Intro‑text konnte nicht geladen werden.';
    });
}

/* ─────────────────────── 4. Carousel navigation ------------------- */
function initCarousel() {
  document.querySelectorAll('.carousel').forEach(carousel => {
    const inner     = carousel.querySelector('.inner');
    const items     = inner.children;
    const wrapper   = carousel.closest('.carousel-wrapper') || carousel; // <‑‑ parent
    const arrowPrev = wrapper.querySelector('.arrow.prev');
    const arrowNext = wrapper.querySelector('.arrow.next');

    /* ------------- figure out one‑slide width ------------- */
    const GAP = 16;                    // 1rem ≈ 16px
    let slideSize;

    const computeSlideSize = () => {
      // The first item’s width + gap
      slideSize = items[0]?.offsetWidth + GAP;
    };

    // Compute after a tiny delay so images/iframes can finish loading
    setTimeout(computeSlideSize, 100);

    let current = 0;

    const update = () => {
      inner.style.transform = `translateX(-${current * slideSize}px)`;
    };

    arrowPrev?.addEventListener('click', () => {
      if (current > 0) { current--; update(); }
    });

    arrowNext?.addEventListener('click', () => {
      if (current < items.length - 1) { current++; update(); }
    });

    /* ---------- Optional: keyboard navigation -------------- */
    document.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') arrowPrev?.click();
      if (e.key === 'ArrowRight') arrowNext?.click();
    });
  });
}

/* ────────────────────────────────────── 5.  Minigame – click the icon to reveal the iframe ────────────────────────────────────── */
function initMinigame() {
  const img   = document.querySelector('#minigame img');
  const frame = document.querySelector('#minigame iframe');
  if (img && frame) {
    img.addEventListener('click', () => {
      frame.style.display = 'block';
    });
  }
}

/* ------------------------------------------------------------------
   Normalise a relative path so that it always points to the
   repository root, regardless of where the document is served.
   ------------------------------------------------------------------ */
function normalisePath(path) {
  // If the path starts with a slash, treat it as *domain‑root*
  // relative and prepend the repository name that GitHub Pages
  // serves under (e.g. /WordIMissions.com/).  When we run
  // locally the repo is the root of the server, so the
  // repository name is ''.
  const repoName = window.location.pathname.split('/')[1] || '';
  return repoName ? `/${repoName}${path}` : path;
}

/* ------------------------------------------------------------------
   Parallax initialisation (unchanged except for the normalisation)
   ------------------------------------------------------------------ */
function initParallax() {
  const sections = document.querySelectorAll('section[data-bg]');
  sections.forEach(sec => {
    const url = normalisePath(sec.dataset.bg);   // <-- normalise here
    sec.style.setProperty('--section-bg', `url('${url}')`);

    sec.style.transform = 'translateX(-30px)';          // start off‑screen
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const sec = entry.target;
      if (entry.isIntersecting) {
        sec.style.transition = 'transform 1.2s ease-out';
        sec.style.transform  = 'translateX(0)';
        observer.unobserve(sec);   // one‑time animation
      } else {
        sec.style.transform = 'translateX(-30px)';   // reset when out of view
      }
    });
  }, { root: null, threshold: 0.1 });

  sections.forEach(sec => observer.observe(sec));
}

/* ────────────────────────────────────── Exported init() – this is called from loadSections.js ────────────────────────────────────── */
export function init() {
  loadWelcome();     // build the welcome section
  initSidebar();     // sidebar navigation
  initCarousel();   // carousel arrows
  initMinigame();   // minigame icon
  initParallax();   // section parallax effect
  /* ----- run loadIntroText for every section that contains an .intro div ----- */
  document.querySelectorAll('section .intro').forEach(sec => loadIntroText(sec.parentElement));
}
