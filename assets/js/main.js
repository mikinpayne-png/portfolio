/* MIKIN_DEV – interactions : menu mobile, apparition au défilement,
   images de secours, galerie + lightbox, formulaire de contact. */
(function () {
  'use strict';

  /* ---------- Année du copyright ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Menu mobile ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('main-nav');
  if (toggle && nav) {
    var setMenu = function (open) {
      nav.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    };
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setMenu(false);
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
  }

  /* ---------- Filtres des projets ---------- */
  var projectFilters = document.querySelectorAll('.project-filter');
  var projectCards = document.querySelectorAll('.project-card[data-project-type]');
  projectFilters.forEach(function (button) {
    button.addEventListener('click', function () {
      var selected = button.dataset.filter;
      projectFilters.forEach(function (filter) {
        var active = filter === button;
        filter.classList.toggle('is-active', active);
        filter.setAttribute('aria-pressed', String(active));
      });
      projectCards.forEach(function (card) {
        var categories = card.dataset.projectType.split(' ');
        card.hidden = !(selected === 'all' || categories.indexOf(selected) !== -1);
      });
    });
  });

  /* ---------- Apparition progressive ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Image absente : on affiche un bloc de secours ---------- */
  document.querySelectorAll('img[data-fallback]').forEach(function (img) {
    var fail = function () { img.parentElement.classList.add('no-image'); };
    if (img.complete && img.naturalWidth === 0) fail();
    img.addEventListener('error', fail);
  });

  /* ---------- Galerie : filtres + lightbox ---------- */
  var gallery = document.getElementById('gallery');
  if (gallery) {
    var items = Array.prototype.slice.call(gallery.querySelectorAll('.gallery-item'));
    var empty = document.getElementById('gallery-empty');
    var filters = document.querySelectorAll('.filter');
    var current = 'all';

    var visibleItems = function () {
      return items.filter(function (it) { return !it.hidden; });
    };
    var visibleImages = function () {
      return visibleItems().filter(function (it) {
        var img = it.querySelector('img');
        return img && img.complete && img.naturalWidth > 0;
      });
    };
    var updateEmpty = function () {
      if (!empty) return;
      var none = visibleItems().length === 0;
      empty.classList.toggle('show', none);
      empty.textContent = items.length === 0
        ? 'La galerie est en cours de constitution : mes créations graphiques seront ajoutées ici très prochainement.'
        : 'Aucune création dans cette catégorie pour le moment.';
    };
    var applyFilter = function (cat) {
      current = cat;
      items.forEach(function (it) {
        it.hidden = !(cat === 'all' || it.dataset.category === cat);
      });
      filters.forEach(function (b) {
        var on = b.dataset.filter === cat;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', String(on));
      });
      updateEmpty();
    };
    filters.forEach(function (b) {
      b.addEventListener('click', function () { applyFilter(b.dataset.filter); });
    });
    updateEmpty();

    /* Lightbox */
    var lb = document.getElementById('lightbox');
    var lbImg = document.getElementById('lb-img');
    var lbCap = document.getElementById('lb-caption');
    var index = 0;
    var lastFocus = null;

    var show = function (i) {
      var list = visibleImages();
      if (!list.length) return;
      index = (i + list.length) % list.length;
      var img = list[index].querySelector('img');
      var cap = list[index].querySelector('figcaption');
      lbImg.src = img.currentSrc || img.src;
      lbImg.alt = img.alt;
      lbCap.textContent = cap ? cap.textContent : '';
    };
    var open = function (item) {
      var list = visibleImages();
      if (list.indexOf(item) === -1) return;
      lastFocus = document.activeElement;
      index = list.indexOf(item);
      show(index);
      lb.hidden = false;
      document.body.style.overflow = 'hidden';
      lb.querySelector('.lb-close').focus();
    };
    var close = function () {
      lb.hidden = true;
      lbImg.src = '';
      document.body.style.overflow = '';
      if (lastFocus) lastFocus.focus();
    };

    gallery.addEventListener('click', function (e) {
      var btn = e.target.closest('.gallery-open');
      if (btn) open(btn.closest('.gallery-item'));
    });
    lb.querySelector('.lb-close').addEventListener('click', close);
    lb.querySelector('.lb-prev').addEventListener('click', function () { show(index - 1); });
    lb.querySelector('.lb-next').addEventListener('click', function () { show(index + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(index - 1);
      if (e.key === 'ArrowRight') show(index + 1);
    });
    /* Balayage tactile */
    var startX = null;
    lb.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
      startX = null;
    });
  }

  /* ---------- Formulaire de contact ---------- */
  var form = document.getElementById('contact-form');
  if (form) {
    var status = document.getElementById('form-status');
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    var setStatus = function (type, text) {
      status.hidden = false;
      status.className = 'form-status ' + type;
      status.textContent = text;
      status.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };
    var setError = function (name, msg) {
      var field = form.elements[name].closest('.field');
      var p = document.getElementById(name + '-error');
      field.classList.toggle('invalid', !!msg);
      p.hidden = !msg;
      p.textContent = msg || '';
    };
    var validate = function () {
      var ok = true;
      var v = function (n) { return form.elements[n].value.trim(); };
      var rules = {
        name: v('name').length < 2 ? 'Veuillez indiquer votre nom complet.' : '',
        email: !v('email') ? 'Veuillez indiquer votre adresse e-mail.'
          : !emailRe.test(v('email')) ? 'Cette adresse e-mail ne semble pas valide.' : '',
        subject: v('subject').length < 3 ? 'Veuillez indiquer un sujet.' : '',
        message: v('message').length < 10 ? 'Votre message doit contenir au moins 10 caractères.' : ''
      };
      Object.keys(rules).forEach(function (k) {
        setError(k, rules[k]);
        if (rules[k]) ok = false;
      });
      return ok;
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      status.hidden = true;

      /* Piège anti-robots : si le champ caché est rempli, on fait semblant. */
      if (form.elements._gotcha.value) {
        setStatus('success', 'Merci ! Votre message a bien été envoyé.');
        form.reset();
        return;
      }
      if (!validate()) {
        var first = form.querySelector('.field.invalid input, .field.invalid textarea');
        if (first) first.focus();
        return;
      }

      var endpoint = form.dataset.endpoint;
      var mailto = form.dataset.mailto;
      var data = {
        name: form.elements.name.value.trim(),
        email: form.elements.email.value.trim(),
        subject: form.elements.subject.value.trim(),
        message: form.elements.message.value.trim()
      };

      if (endpoint) {
        var btn = form.querySelector('button[type="submit"]');
        btn.disabled = true;
        var label = btn.textContent;
        btn.textContent = 'Envoi en cours…';
        fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(data)
        }).then(function (res) {
          if (!res.ok) throw new Error('http ' + res.status);
          setStatus('success', 'Merci ' + data.name + ' ! Votre message a bien été envoyé. Je vous répondrai dans les meilleurs délais.');
          form.reset();
        }).catch(function () {
          setStatus('error', 'Une erreur est survenue : votre message n\'a pas pu être envoyé. Veuillez réessayer dans un instant' + (mailto ? ' ou m\'écrire directement à ' + mailto + '.' : '.'));
        }).then(function () {
          btn.disabled = false;
          btn.textContent = label;
        });
      } else if (mailto) {
        var body = 'Nom : ' + data.name + '\nE-mail : ' + data.email + '\n\n' + data.message;
        window.location.href = 'mailto:' + mailto + '?subject=' + encodeURIComponent(data.subject) + '&body=' + encodeURIComponent(body);
        setStatus('success', 'Votre application de messagerie va s\'ouvrir pour finaliser l\'envoi.');
      } else {
        setStatus('error', 'Le formulaire n\'est pas encore activé sur ce site. Merci de me contacter via LinkedIn ou GitHub en attendant.');
      }
    });
  }
})();
