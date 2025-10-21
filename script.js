/* ===== Mobile Menu ===== */
const burger = document.getElementById('burger');
const nav = document.getElementById('primary-nav');

if (burger && nav) {
  const toggleMenu = () => {
    const expanded = burger.getAttribute('aria-expanded') === 'true';
    burger.setAttribute('aria-expanded', String(!expanded));
    nav.classList.toggle('is-open');
    document.body.classList.toggle('body-lock');
  };

  burger.addEventListener('click', toggleMenu);

  // Close on link click (mobile)
  nav.addEventListener('click', (e) => {
    const target = e.target;
    if (target.matches('.nav__link, .nav__btn')) {
      burger.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
      document.body.classList.remove('body-lock');
    }
  });

  // Close on ESC
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      burger.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
      document.body.classList.remove('body-lock');
    }
  });
}

/* ===== Active link on scroll (basic) ===== */
const sections = ['home','about','services','gallery','reviews'].map(id => document.getElementById(id)).filter(Boolean);
const navLinks = document.querySelectorAll('.nav__link');

const setActive = () => {
  let current = 'home';
  const offset = window.innerHeight * 0.28;
  sections.forEach(sec => {
    const top = sec.getBoundingClientRect().top;
    if (top - offset < 0) current = sec.id;
  });
  navLinks.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === `#${current}`));
};
window.addEventListener('scroll', setActive, { passive: true });
window.addEventListener('load', setActive);




/* ===== Gallery Lightbox ===== */
(function(){
  const grid = document.getElementById('galleryGrid');
  const lightbox = document.getElementById('lightbox');
  if (!grid || !lightbox) return;

  const images = [...grid.querySelectorAll('.gallery__img')];
  const imgEl = document.getElementById('lightboxImg');
  const capEl = document.getElementById('lightboxCap');
  const btnClose = document.getElementById('lightboxClose');
  const btnPrev = document.getElementById('lightboxPrev');
  const btnNext = document.getElementById('lightboxNext');

  const data = images.map((img) => ({
    src: img.getAttribute('src'),
    alt: img.getAttribute('alt') || '',
    cap: img.closest('figure')?.querySelector('figcaption')?.textContent || ''
  }));

  let index = 0;

  const open = (i) => {
    index = i;
    const { src, alt, cap } = data[index];
    imgEl.src = src;
    imgEl.alt = alt;
    capEl.textContent = cap;
    lightbox.classList.add('is-open');
    document.body.classList.add('body-locked');
    lightbox.setAttribute('aria-hidden', 'false');
  };

  const close = () => {
    lightbox.classList.remove('is-open');
    document.body.classList.remove('body-locked');
    lightbox.setAttribute('aria-hidden', 'true');
    imgEl.src = '';
    imgEl.alt = '';
    capEl.textContent = '';
  };

  const prev = () => open((index - 1 + data.length) % data.length);
  const next = () => open((index + 1) % data.length);

  // Click: thumbnail
  grid.addEventListener('click', (e) => {
    const el = e.target.closest('.gallery__img');
    if (!el) return;
    const i = Number(el.dataset.index || 0);
    open(i);
  });

  // Controls
  btnClose?.addEventListener('click', close);
  btnPrev?.addEventListener('click', prev);
  btnNext?.addEventListener('click', next);

  // Backdrop click closes
  lightbox.addEventListener('click', (e) => {
    if (e.target.dataset.close) close();
  });

  // Keyboard
  window.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  }, { passive: true });
})();






/* ===== Testimonials v2 ===== */
(function(){
  const viewport = document.getElementById('tViewport');
  const track = document.getElementById('tTrack');
  const prevBtn = document.getElementById('tPrev');
  const nextBtn = document.getElementById('tNext');
  const dotsWrap = document.getElementById('tDots');
  if(!viewport || !track) return;

  const slides = Array.from(track.children);
  let index = 0;

  // Build dots
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 't-dot';
    dot.type = 'button';
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-controls', `review-slide-${i+1}`);
    dot.addEventListener('click', () => go(i));
    dotsWrap.appendChild(dot);
  });
  const dots = Array.from(dotsWrap.children);

  // A11y labels/ids
  slides.forEach((s, i) => {
    s.id = `review-slide-${i+1}`;
    s.setAttribute('aria-label', `${i+1} of ${slides.length}`);
  });

  function update(){
    const width = viewport.clientWidth;
    track.style.transform = `translateX(${-index * width}px)`;
    dots.forEach((d, i) => d.setAttribute('aria-selected', String(i === index)));
  }

  function go(i){
    index = (i + slides.length) % slides.length;
    update();
  }

  prevBtn?.addEventListener('click', () => go(index - 1));
  nextBtn?.addEventListener('click', () => go(index + 1));
  window.addEventListener('resize', update);

  // Swipe support
  let startX = 0, dx = 0, dragging = false;
  const onStart = x => { dragging = true; startX = x; dx = 0; };
  const onMove  = x => {
    if(!dragging) return;
    dx = x - startX;
    const width = viewport.clientWidth;
    track.style.transform = `translateX(${(-index * width) + dx}px)`;
  };
  const onEnd = () => {
    if(!dragging) return;
    const width = viewport.clientWidth;
    if (Math.abs(dx) > width * 0.18) go(index + (dx < 0 ? 1 : -1));
    else update();
    dragging = false; dx = 0;
  };

  viewport.addEventListener('touchstart', e => onStart(e.touches[0].clientX), { passive:true });
  viewport.addEventListener('touchmove',  e => onMove(e.touches[0].clientX), { passive:true });
  viewport.addEventListener('touchend',   onEnd, { passive:true });

  // Keyboard nav
  viewport.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') prevBtn?.click();
    if (e.key === 'ArrowRight') nextBtn?.click();
  });

  // Init
  go(0);
})();




/* ===== Contact helpers ===== */
(function(){
  // copy address
  document.querySelectorAll('.contact__copy').forEach(btn => {
    btn.addEventListener('click', async () => {
      const text = btn.getAttribute('data-copy') || '';
      try {
        await navigator.clipboard.writeText(text);
        btn.innerHTML = '<i class="fa-regular fa-circle-check"></i> Copied';
        setTimeout(() => btn.innerHTML = '<i class="fa-regular fa-copy"></i> Copy', 1600);
      } catch(e) { /* ignore */ }
    });
  });

  // quick-message -> mailto
  const form = document.getElementById('quickMessage');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const to = form.dataset.sendto || 'bookings@operatingstudio.co.uk';
      const name = encodeURIComponent(form.querySelector('#qm-name').value.trim());
      const email = encodeURIComponent(form.querySelector('#qm-email').value.trim());
      const msg = encodeURIComponent(form.querySelector('#qm-msg').value.trim());
      const subject = `Booking enquiry from ${decodeURIComponent(name)}`;
      const body =
        `Name: ${decodeURIComponent(name)}%0AEmail: ${decodeURIComponent(email)}%0A%0A${msg}`;
      window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${body}`;
    });
  }
})();






/* ===== Footer helpers ===== */
(function(){
  // year
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // back to top visibility + action
  const btn = document.getElementById('backtop');
  const onScroll = () => {
    if (!btn) return;
    const show = window.scrollY > 600;
    btn.classList.toggle('is-visible', show);
  };
  btn?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();






// ===== Pricing: deep-link highlight + booking click handling =====
(function(){
  const byId = (id) => document.getElementById(id);
  const grid = document.getElementById('pricingGrid');
  if (!grid) return;

  const cards = Array.from(grid.querySelectorAll('.p-card'));

  // Highlight a card from ?service=skin-fade, etc.
  const params = new URLSearchParams(window.location.search);
  const wanted = params.get('service');
  if (wanted) {
    const match = cards.find(c => (c.dataset.service || '').toLowerCase() === wanted.toLowerCase());
    if (match) {
      cards.forEach(c => c.classList.remove('is-selected'));
      match.classList.add('is-selected');
      match.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  // Click: "Book via Square"
  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('.p-book');
    if (!btn) return;
    const card = btn.closest('.p-card');
    const url  = card?.dataset.url?.trim();

    // If you’ve set a Square deep-link for this service, open it.
    if (url) {
      window.open(url, '_blank', 'noopener');
      return;
    }
    // Otherwise, jump to the embedded widget area.
    const mount = document.getElementById('squareMount');
    if (mount) mount.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
})();
