/* ============================================================
   EB SERVICE — Interactions & animations GSAP
   ============================================================ */
document.documentElement.classList.remove('no-js');

/* ============================================================
   >>> À CONFIGURER : adresse de réception des demandes de devis.
   Tant que cette valeur reste vide, le formulaire n'envoie rien
   automatiquement : il affiche la confirmation avec le bouton
   d'appel, et masque le lien "ouvrir dans ma messagerie".
   Renseignez l'email d'EB SERVICE pour activer l'envoi.
   ============================================================ */
const DEST_EMAIL = '';

/* ---------- Header : fond au scroll ---------- */
const header = document.querySelector('.site-header');
const onScroll = () => {
  if (window.scrollY > 40) header.classList.add('scrolled');
  else header.classList.remove('scrolled');
};
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

/* ---------- Menu mobile ---------- */
const burger = document.querySelector('.nav__burger');
const links = document.querySelector('.nav__links');
if (burger) {
  if (!links.id) links.id = 'nav-links';
  burger.setAttribute('aria-expanded', 'false');
  burger.setAttribute('aria-controls', links.id);
  const setState = isOpen => {
    burger.classList.toggle('open', isOpen);
    links.classList.toggle('open', isOpen);
    document.body.classList.toggle('menu-open', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
    burger.setAttribute('aria-label', isOpen ? 'Fermer le menu' : 'Menu');
  };
  const closeMenu = () => setState(false);
  burger.addEventListener('click', () => setState(!burger.classList.contains('open')));
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('click', e => {
    if (document.body.classList.contains('menu-open') &&
        !links.contains(e.target) && !burger.contains(e.target)) closeMenu();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
}

/* ---------- Animations GSAP ---------- */
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (window.gsap && !reduceMotion) {
  gsap.registerPlugin(ScrollTrigger);

  const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  heroTl
    .from('.hero__eyebrow', { y: 24, opacity: 0, duration: .7 })
    .from('.hero h1', { y: 40, opacity: 0, duration: .9 }, '-=.4')
    .from('.hero__sub', { y: 26, opacity: 0, duration: .8 }, '-=.55')
    .from('.hero__actions .btn', { y: 22, opacity: 0, duration: .6, stagger: .12 }, '-=.5')
    .from('.hero__scroll', { opacity: 0, duration: .8 }, '-=.2');

  gsap.from('.hero-page .breadcrumb, .hero-page h1, .hero-page p', {
    y: 30, opacity: 0, duration: .8, stagger: .12, ease: 'power3.out', delay: .15
  });

  // Parallaxe discrète sur les médias de hero
  gsap.utils.toArray('.hero__media, .hero-page__media').forEach(media => {
    gsap.to(media, {
      yPercent: 18, ease: 'none',
      scrollTrigger: { trigger: media.closest('.hero, .hero-page'), start: 'top top', end: 'bottom top', scrub: true }
    });
  });

  gsap.utils.toArray('.reveal').forEach(el => {
    gsap.set(el, { y: 40, opacity: 0 });
    gsap.to(el, {
      opacity: 1, y: 0, duration: .9, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%' }
    });
  });

  gsap.utils.toArray('[data-stagger]').forEach(group => {
    const items = group.children;
    gsap.set(items, { y: 46, opacity: 0 });
    gsap.to(items, {
      y: 0, opacity: 1, duration: .8, ease: 'power3.out', stagger: .12,
      scrollTrigger: { trigger: group, start: 'top 82%' }
    });
  });

  gsap.utils.toArray('.stat__num[data-count]').forEach(num => {
    const target = parseFloat(num.dataset.count);
    const suffix = num.dataset.suffix || '';
    const obj = { val: 0 };
    ScrollTrigger.create({
      trigger: num, start: 'top 88%', once: true,
      onEnter: () => gsap.to(obj, {
        val: target, duration: 1.6, ease: 'power2.out',
        onUpdate: () => { num.textContent = Math.round(obj.val) + suffix; }
      })
    });
  });
} else {
  // Animations coupées (reduced-motion ou GSAP indisponible) :
  // on affiche les contenus et la valeur finale des compteurs.
  document.querySelectorAll('.reveal').forEach(el => el.style.opacity = 1);
  document.querySelectorAll('.stat__num[data-count]').forEach(num => {
    num.textContent = num.dataset.count + (num.dataset.suffix || '');
  });
}

/* ---------- Accordéon des prestations ---------- */
document.querySelectorAll('.accordion').forEach(acc => {
  acc.querySelectorAll('.accordion__trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const item = trigger.closest('.accordion__item');
      const isOpen = item.classList.toggle('open');
      trigger.setAttribute('aria-expanded', String(isOpen));
    });
  });
});

/* ---------- Avant / Après : slider (souris, tactile, clavier) ---------- */
document.querySelectorAll('.ba-slider').forEach(slider => {
  const after = slider.querySelector('.ba-slider__after');
  const handle = slider.querySelector('.ba-slider__handle');
  let dragging = false;
  let pct = 50;

  const apply = value => {
    pct = Math.max(0, Math.min(100, value));
    after.style.clipPath = `inset(0 0 0 ${pct}%)`;
    handle.style.left = pct + '%';
    handle.setAttribute('aria-valuenow', Math.round(pct));
  };
  const setFromX = clientX => {
    const rect = slider.getBoundingClientRect();
    apply(((clientX - rect.left) / rect.width) * 100);
  };

  const start = () => dragging = true;
  const stop = () => dragging = false;
  const move = e => { if (!dragging) return; setFromX(e.touches ? e.touches[0].clientX : e.clientX); };

  handle.addEventListener('mousedown', start);
  handle.addEventListener('touchstart', start, { passive: true });
  window.addEventListener('mouseup', stop);
  window.addEventListener('touchend', stop);
  window.addEventListener('mousemove', move);
  window.addEventListener('touchmove', move, { passive: true });
  slider.addEventListener('click', e => { if (e.target === handle) return; setFromX(e.clientX); });

  // Accessibilité clavier : flèches, Début / Fin
  handle.addEventListener('keydown', e => {
    const step = e.shiftKey ? 10 : 2;
    if (e.key === 'ArrowLeft') { apply(pct - step); e.preventDefault(); }
    else if (e.key === 'ArrowRight') { apply(pct + step); e.preventDefault(); }
    else if (e.key === 'Home') { apply(0); e.preventDefault(); }
    else if (e.key === 'End') { apply(100); e.preventDefault(); }
  });
});

/* ---------- Horaires : met en avant le jour courant ---------- */
const hoursList = document.getElementById('hours');
if (hoursList) {
  const today = new Date().getDay(); // 0 = dimanche
  const li = hoursList.querySelector(`li[data-day="${today}"]`);
  if (li) {
    li.classList.add('is-today');
    li.querySelector('.day').insertAdjacentHTML('beforeend',
      ' <small style="color:var(--taupe);font-weight:600">(aujourd\'hui)</small>');
  }
}

/* ---------- Formulaire de demande de devis ---------- */
const rdvForm = document.getElementById('rdv-form');
if (rdvForm) {
  const dateInput = rdvForm.querySelector('#date');
  if (dateInput) {
    const d = new Date();
    d.setDate(d.getDate() + 1); // au plus tôt : demain
    dateInput.min = d.toISOString().split('T')[0];
  }

  const showError = (field, on) => field.closest('.field').classList.toggle('error', on);

  rdvForm.addEventListener('submit', async e => {
    e.preventDefault();
    let valid = true;

    rdvForm.querySelectorAll('[required]').forEach(input => {
      const empty = !input.value.trim();
      showError(input, empty);
      if (empty) valid = false;
    });

    const email = rdvForm.querySelector('#email');
    if (email && email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      showError(email, true); valid = false;
    }
    const tel = rdvForm.querySelector('#tel');
    if (tel && tel.value && !/^[0-9+\s.\-]{8,}$/.test(tel.value)) {
      showError(tel, true); valid = false;
    }
    const prestaChecked = rdvForm.querySelectorAll('input[name="prestation"]:checked').length > 0;
    const prestaGroup = rdvForm.querySelector('.pills');
    if (prestaGroup) prestaGroup.closest('.field').classList.toggle('error', !prestaChecked);
    if (!prestaChecked) valid = false;

    if (!valid) {
      const firstErr = rdvForm.querySelector('.field.error');
      if (firstErr) {
        firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const focusable = firstErr.querySelector('input, select, textarea');
        if (focusable) focusable.focus({ preventScroll: true });
      }
      return;
    }

    const data = new FormData(rdvForm);
    const prestations = data.getAll('prestation').join(', ');
    const nom = data.get('nom');
    const dateStr = data.get('date')
      ? new Date(data.get('date')).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
      : 'dès que possible';

    const body =
`Bonjour,

Je souhaite un devis pour : ${prestations}.

Nom : ${nom}
Téléphone : ${data.get('tel')}
Email : ${data.get('email')}
Adresse du chantier : ${data.get('adresse') || '(non précisée)'}
Date souhaitée : ${dateStr}
Créneau : ${data.get('creneau') || '(indifférent)'}

Description :
${data.get('message') || '(aucune)'}`;

    const success = document.getElementById('form-success');
    const mailLink = success.querySelector('.recap-mail');
    if (mailLink) {
      if (DEST_EMAIL) {
        mailLink.href = `mailto:${DEST_EMAIL}?subject=${encodeURIComponent('Demande de devis — ' + nom)}&body=${encodeURIComponent(body)}`;
      } else {
        mailLink.style.display = 'none'; // pas d'adresse configurée
      }
    }
    success.querySelector('.recap-name').textContent = nom;
    success.querySelector('.recap-details').textContent =
      `${prestations} — souhait : ${dateStr}${data.get('creneau') ? ' (' + data.get('creneau') + ')' : ''}`;

    const submitBtn = rdvForm.querySelector('button[type="submit"]');
    const btnHtml = submitBtn.innerHTML;

    const showSuccess = () => {
      rdvForm.style.display = 'none';
      success.classList.add('show');
      success.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (window.gsap && !reduceMotion) gsap.from(success, { y: 20, opacity: 0, duration: .6, ease: 'power3.out' });
    };

    // Aucune adresse de réception : on confirme sans tenter d'envoi
    if (!DEST_EMAIL) {
      console.warn("DEST_EMAIL n'est pas renseigné dans js/main.js — la demande n'est pas transmise automatiquement.");
      showSuccess();
      return;
    }

    submitBtn.disabled = true;
    submitBtn.style.opacity = '.7';
    submitBtn.innerHTML = 'Envoi en cours…';

    const payload = {
      _subject: 'Nouvelle demande de devis — ' + nom,
      Prestation: prestations,
      Nom: nom,
      Téléphone: data.get('tel'),
      Email: data.get('email'),
      'Adresse du chantier': data.get('adresse') || '(non précisée)',
      'Date souhaitée': dateStr,
      Créneau: data.get('creneau') || '(indifférent)',
      Description: data.get('message') || '(aucune)',
      _template: 'table',
      _replyto: data.get('email')
    };

    try {
      const res = await fetch('https://formsubmit.co/ajax/' + DEST_EMAIL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      showSuccess();
    } catch (err) {
      console.warn('Envoi automatique indisponible, repli sur mailto.', err);
      showSuccess();
    } finally {
      submitBtn.disabled = false;
      submitBtn.style.opacity = '';
      submitBtn.innerHTML = btnHtml;
    }
  });

  rdvForm.querySelectorAll('input, select, textarea').forEach(input =>
    input.addEventListener('input', () => input.closest('.field')?.classList.remove('error'))
  );
}

/* ---------- Année du footer ---------- */
document.querySelectorAll('.year').forEach(el => el.textContent = new Date().getFullYear());
