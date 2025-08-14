/*=============================================================
  core JavaScript for the site (interactivity + animations)
============================================================*/

/*=============================================================
  1️⃣  Welcome section – build the words + shuffle/restore buttons
============================================================*/
async function loadWelcome() {
    /* ----------------------------------------------------
       1.  Fetch welcome‑words from JSON, fall back to hard‑coded list
    ---------------------------------------------------- */
    let data;
    try {
        const res = await fetch('assets/data/welcome.json');
        data = await res.json();   // { words: [...] }
    } catch (_) {
        data = {
            words: [
                "Hello", " ","Welcome"," ", "to", " ","my", " ","Website"," ", "with","<br>", "my"," ",
                "Natty_Word_I_Missions"," ", "and"," ", "the", " ","Pixels_I_Vision"
            ]
        };
    }

    /* ----------------------------------------------------
       2.  Get the <section id="welcome"> that loadSections.js just inserted
    ---------------------------------------------------- */
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

    /* ---- Build (or rebuild) the welcome headline ---- */
    function buildWelcomeHeadline() {
        headingContainer.innerHTML = '';
        const h1 = document.createElement('h1');
        data.words.forEach((w, i) => {
            if (w === '<br>') h1.appendChild(document.createElement('br'));
            else {
                const span = document.createElement('span');
                span.textContent = w;
                span.className = 'word';
                h1.appendChild(span);
            }
        });
        headingContainer.appendChild(h1);
    }
    buildWelcomeHeadline();

    /* ---- Shuffle / restore controls ---- */
    const ctrl = document.createElement('div');
    ctrl.className = 'ctrl';
    const shuffleBtn = document.createElement('button');
    shuffleBtn.id = 'shuffleBtn';
    shuffleBtn.textContent = 'Shuffle';
    const restoreBtn = document.createElement('button');
    restoreBtn.id = 'restoreBtn';
    restoreBtn.textContent = 'Restore';
    ctrl.appendChild(shuffleBtn);
    ctrl.appendChild(restoreBtn);
    section.appendChild(ctrl);

    shuffleBtn.classList.add('btn', 'btn-primary');
    restoreBtn.classList.add('btn', 'btn-primary');

    /* ----------------------------------------------------
       3.  Animate the words (fade‑in on load)
    ---------------------------------------------------- */
    const words = headingContainer.querySelectorAll('.word');
    words.forEach((w, i) => setTimeout(() => w.classList.add('show'), i * 200));

    /* ----------------------------------------------------
       4.  Shuffle / restore logic
    ---------------------------------------------------- */
    const shuffleString = s => {
        const arr = s.split('');
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr.join('');
    };

    shuffleBtn.addEventListener('click', () => {
        const words = headingContainer.querySelectorAll('.word');
        words.forEach((w, i) => {
            w.style.transitionDelay = `${i * 100}ms`;
            w.textContent = shuffleString(w.textContent);
            w.classList.remove('show');
            setTimeout(() => w.classList.add('show'), i * 100 + 50);
        });
    });

    restoreBtn.addEventListener('click', () => {
        buildWelcomeHeadline();
        const newWords = headingContainer.querySelectorAll('.word');
        newWords.forEach((w, i) => {
            w.style.transitionDelay = `${i * 100}ms`;
            w.classList.remove('show');
            setTimeout(() => w.classList.add('show'), i * 100 + 50);
        });
    });
}

/*=============================================================
  2️⃣  Sidebar navigation – smooth scrolling
============================================================*/
function initSidebar() {
    document.querySelectorAll('#sidebar button[data-target]').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = document.querySelector(btn.dataset.target);
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        });
    });
}

/*=============================================================
  3️⃣  Load intro‑text files (used by the .intro containers)
============================================================*/
function loadIntroText(section) {
    const container = section.querySelector('.intro');
    if (!container) return;            // no intro container → nothing to do

    const src = container.dataset.src;   // e.g. "assets/data/natty_intro.txt"
    fetch(src)
        .then(resp => {
            if (!resp.ok) throw new Error(`Failed to load ${src}`);
            return resp.text();
        })
        .then(text => {
            const carousel = section.querySelector('.carousel');
            if (!carousel) return;          // no carousel in this section

            const inner = carousel.querySelector('.inner');

            // create the item element
            const introItem = document.createElement('div');
            introItem.className = 'item intro-item';
            introItem.innerHTML = text.replace(/\n/g, '<br>');

            // insert it **before** the first real slide
            inner.insertBefore(introItem, inner.firstChild);

            // optional: make it fade‑in after the page loads
            setTimeout(() => introItem.classList.add('show'), 300); // 0.3 s delay
        })
        .catch(err => {
            console.error(err);
            container.textContent = 'Intro‑text konnte nicht geladen werden.';
        });
}

/*=============================================================
  4️⃣  Sidebar toggle (mobile only)
============================================================*/
function initSidebarToggle() {
    // create the button
    const btn = document.createElement('button');
    btn.id = 'sidebar-toggle';
    btn.innerHTML = '&#9776;';      // ☰
    document.body.appendChild(btn);

    btn.addEventListener('click', () => {
        document.body.classList.toggle('sidebar-open');
    });
}

/*=============================================================
  5️⃣  Swipe support helper for the carousel
============================================================*/


/*=============================================================
  6️⃣  Carousel navigation (desktop + mobile)
============================================================*/
function addSwipeSupport(carousel) {
    const inner = carousel.querySelector('.inner');
    const items = inner.children;
    const gap = 16;            // px (same as before)
    const minDiff = 50;           // px – threshold to trigger a slide
    let startX = 0;

    inner.addEventListener('touchstart', e => {
        startX = e.touches[0].clientX;
    });

    inner.addEventListener('touchend', e => {
        const endX = e.changedTouches[0].clientX;
        const deltaX = endX - startX;

        if (Math.abs(deltaX) < minDiff) return;   // too small

        const wrapper = carousel.closest('.carousel-wrapper') || carousel;
        const arrowPrev = wrapper.querySelector('.arrow.prev');
        const arrowNext = wrapper.querySelector('.arrow.next');

        // figure out current index (based on transform)
        const current = Math.round(
            parseFloat(inner.style.transform.replace(/[^\d.]/g, '')) / (items[0].offsetWidth + gap)
        );

        if (deltaX < 0 && current < items.length - 1) {
            arrowNext?.click();
        } else if (deltaX > 0 && current > 0) {
            arrowPrev?.click();
        }
    });
}

function initCarousel() {
    document.querySelectorAll('.carousel').forEach(carousel => {
        const inner = carousel.querySelector('.inner');
        const items = inner.children;
        const wrapper = carousel.closest('.carousel-wrapper') || carousel;
        const arrowPrev = wrapper.querySelector('.arrow.prev');
        const arrowNext = wrapper.querySelector('.arrow.next');

        /* figure out one‑slide width */
        const GAP = 16;
        let slideSize;

        const computeSlideSize = () => {
            slideSize = items[0]?.offsetWidth + GAP;
        };

        setTimeout(computeSlideSize, 100);

        let current = 0;
        const update = () => {
            inner.style.transform = `translateX(-${current * slideSize}px)`;
        };

        arrowPrev?.addEventListener('click', () => {
            if (current > 0) { 
                current--; 
                update(); 
            }
        });

        arrowNext?.addEventListener('click', () => {
            if (current < items.length - 1) { 
                current++; 
                update(); 
            }
        });

        addSwipeSupport(carousel);

        /* keyboard navigation */
        document.addEventListener('keydown', e => {
            if (e.key === 'ArrowLeft') arrowPrev?.click();
            if (e.key === 'ArrowRight') arrowNext?.click();  
        });
    });
}
/*=============================================================
  7️⃣  Minigame – click the icon to reveal the iframe
============================================================*/
function initMinigame() {
    const img   = document.querySelector('#minigame img');
    const frame = document.querySelector('#minigame iframe');
    if (img && frame) {
        img.addEventListener('click', () => {
            frame.style.display = 'block';
        });
    }
}

/*=============================================================
  8️⃣  Normalise a relative path so that it always points to the
      repository root, regardless of where the document is served.
============================================================*/
function normalisePath(path) {
    const repoName = window.location.pathname.split('/')[1] || '';
    return repoName ? `/${repoName}${path}` : path;
}

/*=============================================================
  9️⃣  Parallax initialisation
============================================================*/
function initParallax() {
    const sections = document.querySelectorAll('section[data-bg]');
    sections.forEach(sec => {
        const url = normalisePath(sec.dataset.bg);
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

/*=============================================================
  🔟  Exported init() – called from loadSections.js
============================================================*/
export function init() {
    loadWelcome();            // build the welcome section
    initSidebar();            // sidebar navigation
    initSidebarToggle();      // mobile hamburger
    initCarousel();           // carousel arrows + swipe
    initMinigame();           // minigame icon
    initParallax();           // parallax background
    document.querySelectorAll('section .intro').forEach(sec => loadIntroText(sec.parentElement));
}
