/* ============================================================
   PORTOFOLIO — script.js
   Semua logika interaksi & animasi tanpa library tambahan.
   Data teman dibaca langsung dari atribut data-* di HTML.
   ============================================================ */

const EMAIL = 'halo@bimantara.id';

/* ================= HELPER ================= */
const $  = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer    = matchMedia('(hover:hover) and (pointer:fine)').matches;

const renderIcons = () => window.lucide && lucide.createIcons();
renderIcons();

/* ================= TOAST ================= */
function toast(msg, icon = 'check'){
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `<i data-lucide="${icon}"></i><span>${msg}</span>`;
  $('#toastWrap').appendChild(el);
  renderIcons();
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 420); }, 2800);
}

/* ================= PRELOADER ================= */
(function preloader(){
  const pre = $('#preloader'), count = $('#preCount');
  const dur = prefersReduced ? 150 : 1100;
  const t0 = performance.now();
  (function tick(now){
    const p = Math.min((now - t0) / dur, 1);
    count.textContent = Math.round((1 - Math.pow(1 - p, 3)) * 100); // ease-out
    if (p < 1) requestAnimationFrame(tick);
    else {
      pre.classList.add('done');
      document.body.classList.add('loaded');
      setTimeout(() => pre.remove(), 1000);
      // setelah reveal judul selesai, hapus delay agar hover huruf responsif
      setTimeout(() => {
        $('#heroTitle').classList.add('title-done');
        $$('#heroTitle .char').forEach(c => c.style.transitionDelay = '0s');
      }, 1800);
    }
  })(t0);
})();

/* ================= PECAH JUDUL HERO PER HURUF ================= */
 $$('#heroTitle .line').forEach(line => {
  const base = 0.5 + Number(line.dataset.line) * 0.12;
  const text = line.textContent;
  line.textContent = '';
  [...text].forEach((ch, i) => {
    const s = document.createElement('span');
    s.className = 'char';
    s.textContent = ch;
    s.style.transitionDelay = `${base + i * 0.045}s`;
    line.appendChild(s);
  });
});

/* ================= JAM WIB REALTIME ================= */
(function clock(){
  const el = $('#clock');
  const fmt = new Intl.DateTimeFormat('id-ID', {
    timeZone:'Asia/Jakarta', hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:false
  });
  const update = () => el.textContent = fmt.format(new Date()).replace(/\./g, ':');
  update(); setInterval(update, 1000);
})();

/* ================= PROGRESS BAR SCROLL ================= */
const progressBar = $('#scrollProgress');
function updateProgress(){
  const max = document.documentElement.scrollHeight - innerHeight;
  progressBar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
}

/* ================= HEADER: blur, sembunyi, nav aktif ================= */
const header = $('#siteHeader');
let lastY = window.scrollY, menuOpen = false;
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  header.classList.toggle('scrolled', y > 40);
  if (!menuOpen){
    if (y > 140 && y > lastY + 4) header.classList.add('hidden');
    else if (y < lastY - 4 || y <= 140) header.classList.remove('hidden');
  }
  mqBoost = Math.min(Math.abs(y - lastY) * 0.12, 7); // kecepatan scroll → boost marquee
  lastY = y;
  updateProgress();
}, { passive:true });

const navIO = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting){
      $$('.nav-link').forEach(l => l.classList.toggle('active', l.dataset.nav === e.target.id));
    }
  });
}, { rootMargin:'-45% 0px -50% 0px' });
['tentang','teman','bakat','kontak'].forEach(id => navIO.observe(document.getElementById(id)));

/* ================= MENU SELULER ================= */
const mobileMenu = $('#mobileMenu');
function setMenu(open){
  menuOpen = open;
  mobileMenu.classList.toggle('open', open);
  mobileMenu.setAttribute('aria-hidden', String(!open));
  document.body.style.overflow = open ? 'hidden' : '';
  header.classList.remove('hidden');
}
 $('#menuToggle').addEventListener('click', () => setMenu(true));
 $('#menuClose').addEventListener('click', () => setMenu(false));
 $$('.m-link').forEach(a => a.addEventListener('click', () => setMenu(false)));

/* ================= REVEAL SAAT SCROLL ================= */
const revealIO = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting){ e.target.classList.add('in-view'); revealIO.unobserve(e.target); }
  });
}, { threshold:0.12 });
 $$('.reveal').forEach(el => revealIO.observe(el));

/* ================= COUNTER STATISTIK ================= */
const countIO = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    countIO.unobserve(e.target);
    const target = +e.target.dataset.count, t0 = performance.now(), dur = 1400;
    (function step(now){
      const p = Math.min((now - t0) / dur, 1);
      e.target.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target);
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  });
}, { threshold:0.5 });
 $$('[data-count]').forEach(el => countIO.observe(el));

/* ================= MARQUEE (kecepatan mengikuti scroll) ================= */
const marqueeBox = $('.marquee'), mqTrack = $('.marquee-track');
let mqX = 0, mqBoost = 0, mqPaused = false;
if (finePointer){
  marqueeBox.addEventListener('mouseenter', () => mqPaused = true);
  marqueeBox.addEventListener('mouseleave', () => mqPaused = false);
}
function marqueeStep(dt){
  if (mqPaused) return;
  mqBoost += (0 - mqBoost) * 0.05;                       // kembali perlahan ke kecepatan normal
  mqX = (mqX + (0.9 + mqBoost) * dt) % (mqTrack.scrollWidth / 2);
  mqTrack.style.transform = `translate3d(${-mqX}px,0,0)`;
}

/* ================= TILT 3D HALUS PADA KARTU TEMAN ================= */
if (finePointer && !prefersReduced){
  $$('.friend-card').forEach(card => {
    const photo = card.querySelector('.friend-photo');
    let raf = null;
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width  - 0.5;   // -0.5 .. 0.5
      const py = (e.clientY - r.top)  / r.height - 0.5;
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        photo.style.transform =
          `perspective(900px) rotateX(${(-py * 5).toFixed(2)}deg) rotateY(${(px * 6).toFixed(2)}deg) translateY(-7px)`;
      });
    });
    card.addEventListener('mouseleave', () => {
      if (raf) cancelAnimationFrame(raf);
      photo.style.transform = ''; // kembali ke posisi normal lewat transisi CSS
    });
  });
}

/* ================= MODAL PROFIL TEMAN + NAVIGASI ================= */
const cards = $$('#friendsGrid .friend-card');
const total = cards.length;
const modal = $('#friendModal');
const panel = modal.querySelector('.modal-panel');
let current = 0;

function fillModal(i){
  const card = cards[i];
  const d = card.dataset;
  const photo = card.querySelector('.friend-photo img');
  const ig = (d.ig || '').replace(/^@/, ''); // buang "@" kalau ada
  $('#modalImg').src  = photo.src;
  $('#modalImg').alt  = photo.alt;
  $('#modalTitle').textContent   = d.name;
  $('#modalTag').textContent     = d.tag;
  $('#modalIgName').textContent  = '@' + ig;
  $('#modalIg').href             = 'https://instagram.com/' + ig;
  $('#modalBio').textContent     = d.bio;
  $('#modalSince').textContent   = d.since;
  $('#modalHobby').textContent   = d.hobby;
  $('#modalCity').textContent    = d.city;
  $('#modalCount').textContent   = `${String(i + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
}
function openFriend(i){
  current = (i + total) % total;
  fillModal(current);
  // picu animasi swap kecil saat isi berubah
  panel.classList.remove('swap');
  void panel.offsetWidth; // paksa reflow agar animasi bisa diulang
  panel.classList.add('swap');
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}
function navFriend(step){ openFriend(current + step); }
function closeModal(){
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}
 $('#friendsGrid').addEventListener('click', e => {
  // biarkan tombol Instagram bekerja normal — jangan buka modal
  if (e.target.closest('.friend-ig')) return;
  const card = e.target.closest('.friend-card');
  if (card) openFriend(cards.indexOf(card));
});
 $('#friendsGrid').addEventListener('keydown', e => {
  if (e.target.closest('.friend-ig')) return; // Enter pada link IG = navigasi, bukan modal
  const card = e.target.closest('.friend-card');
  if (card && (e.key === 'Enter' || e.key === ' ')){ e.preventDefault(); openFriend(cards.indexOf(card)); }
});
 $('#modalPrev').addEventListener('click', () => navFriend(-1));
 $('#modalNext').addEventListener('click', () => navFriend(1));
 $('#modalClose').addEventListener('click', closeModal);
 $('#modalOverlay').addEventListener('click', closeModal);
 $('#modalCta').addEventListener('click', () => closeModal());
document.addEventListener('keydown', e => {
  if (!modal.classList.contains('open')) return;
  if (e.key === 'Escape') closeModal();
  else if (e.key === 'ArrowRight') navFriend(1);
  else if (e.key === 'ArrowLeft')  navFriend(-1);
});

/* ================= ACCORDION BAKAT ================= */
const services = $$('#services .service');
function setService(item, open){
  const body = item.querySelector('.service-body');
  item.classList.toggle('open', open);
  item.querySelector('.service-head').setAttribute('aria-expanded', String(open));
  body.style.maxHeight = open ? body.scrollHeight + 'px' : '0px';
}
services.forEach(item => {
  item.querySelector('.service-head').addEventListener('click', () => {
    const willOpen = !item.classList.contains('open');
    services.forEach(s => setService(s, false));
    if (willOpen) setService(item, true);
  });
});
setService(services[0], true); // buka item pertama secara bawaan

/* ================= FORM KONTAK ================= */
const form = $('#contactForm');
function setErr(input, msg){
  const field = input.closest('.field');
  field.classList.toggle('error', !!msg);
  field.querySelector('.field-error').textContent = msg || '';
}
form.addEventListener('submit', e => {
  e.preventDefault();
  const nama = $('#fNama'), email = $('#fEmail'), pesan = $('#fPesan');
  let ok = true;
  if (nama.value.trim().length < 2){ setErr(nama, 'Mohon isi nama Anda.'); ok = false; } else setErr(nama);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())){ setErr(email, 'Alamat email tidak valid.'); ok = false; } else setErr(email);
  if (pesan.value.trim().length < 10){ setErr(pesan, 'Ceritakan proyek Anda (min. 10 karakter).'); ok = false; } else setErr(pesan);
  if (!ok){ toast('Periksa kembali isian formulir.', 'alert-circle'); return; }

  const btn = $('#submitBtn'), label = $('#submitLabel'), icon = $('#submitIcon');
  btn.disabled = true;
  label.textContent = 'Terkirim';
  icon.innerHTML = '<i data-lucide="check"></i>';
  renderIcons();
  toast('Pesan terkirim. Saya akan membalas segera.');
  setTimeout(() => {
    form.reset(); btn.disabled = false;
    label.textContent = 'Kirim Pesan';
    icon.innerHTML = '<i data-lucide="send"></i>';
    renderIcons();
  }, 2600);
});

/* ================= SALIN EMAIL ================= */
 $('#emailCopy').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(EMAIL);
    toast('Email disalin ke papan klip.');
  } catch {
    const ta = document.createElement('textarea');
    ta.value = EMAIL; document.body.appendChild(ta); ta.select();
    document.execCommand('copy'); ta.remove();
    toast('Email disalin ke papan klip.');
  }
});

/* ================= TOMBOL MAGNETIK ================= */
if (finePointer){
  $$('.magnetic').forEach(el => {
    el.style.transition = 'transform .35s cubic-bezier(.22,1,.36,1), color .35s';
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.25;
      const y = (e.clientY - r.top - r.height / 2) * 0.35;
      el.style.transform = `translate(${x}px, ${y}px)`;
    });
    el.addEventListener('mouseleave', () => el.style.transform = '');
  });
}

/* ================= PARALLAX RINGAN ================= */
const heroTitle   = $('#heroTitle');
const aboutFigure = $('#aboutFigure'), aboutImg = $('#aboutImg');
function parallax(){
  if (prefersReduced || innerWidth < 760) return;
  const sy = window.scrollY;
  if (sy < innerHeight) heroTitle.style.transform = `translateY(${sy * 0.14}px)`;
  const r = aboutFigure.getBoundingClientRect();
  if (r.bottom > 0 && r.top < innerHeight){
    const p = (r.top + r.height / 2 - innerHeight / 2) / (innerHeight / 2 + r.height / 2); // -1..1
    aboutImg.style.transform = `translateY(${p * -6}%)`;
  }
}

/* ================= LOOP ANIMASI UTAMA (marquee) ================= */
let lastT = performance.now();
(function loop(t){
  const dt = Math.min(t - lastT, 50); lastT = t;
  if (!prefersReduced) marqueeStep(dt);
  requestAnimationFrame(loop);
})(lastT);

/* ================= INISIALISASI & KEMBALI KE ATAS ================= */
window.addEventListener('resize', updateProgress);
window.addEventListener('load', updateProgress);
updateProgress();
parallax();

 $('#toTop').addEventListener('click', () => window.scrollTo({ top:0, behavior: prefersReduced ? 'auto' : 'smooth' }));