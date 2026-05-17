(function () {
  'use strict';

  var photos = [];
  var currentIndex = 0;
  var dlg = document.querySelector('[data-lightbox]');
  var lbImg = dlg ? dlg.querySelector('.lb-img') : null;
  var lbCaption = dlg ? dlg.querySelector('[data-lb-caption]') : null;

  function open(i) {
    if (!dlg || !photos.length) return;
    currentIndex = (i + photos.length) % photos.length;
    var p = photos[currentIndex];
    lbImg.src = p.src;
    lbImg.alt = p.caption || '';
    lbCaption.textContent = (currentIndex + 1) + ' / ' + photos.length;
    if (typeof dlg.showModal === 'function') {
      if (!dlg.open) dlg.showModal();
    } else {
      dlg.setAttribute('open', '');
    }
  }
  function next() { open(currentIndex + 1); }
  function prev() { open(currentIndex - 1); }
  function close() { if (dlg && dlg.open) dlg.close(); }

  function render(list) {
    var el = document.querySelector('[data-gallery]');
    if (!el) return;
    if (!list || !list.length) {
      el.innerHTML = '<p class="empty">Photos will appear here soon. ' +
        'Drop them in <code>photos/</code> and matching thumbnails in <code>photos/thumbnails/</code>.</p>';
      return;
    }
    photos = list.map(function (p) {
      return {
        src: p.src,
        thumb: p.thumb || p.src,
        caption: p.caption || p.src.split('/').pop()
      };
    });
    el.innerHTML = photos.map(function (p, i) {
      return '<a href="' + p.src + '" data-index="' + i + '" aria-label="Open photo ' + (i + 1) + '">' +
        '<img src="' + p.thumb + '" alt="" loading="lazy" decoding="async" /></a>';
    }).join('');

    document.querySelectorAll('[data-stat="photos"]').forEach(function (n) { n.textContent = photos.length; });

    el.addEventListener('click', function (e) {
      var a = e.target.closest('a[data-index]');
      if (!a) return;
      e.preventDefault();
      open(parseInt(a.dataset.index, 10) || 0);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (dlg) {
      dlg.querySelector('[data-lb-close]').addEventListener('click', close);
      dlg.querySelector('[data-lb-prev]').addEventListener('click', prev);
      dlg.querySelector('[data-lb-next]').addEventListener('click', next);
      dlg.addEventListener('click', function (e) { if (e.target === dlg) close(); });
      document.addEventListener('keydown', function (e) {
        if (!dlg.open) return;
        if (e.key === 'ArrowRight') next();
        else if (e.key === 'ArrowLeft') prev();
      });
    }

    fetch('data/photos.json', { cache: 'no-cache' })
      .then(function (r) { return r.ok ? r.json() : { photos: [] }; })
      .then(function (data) { render(data.photos || []); })
      .catch(function () { render([]); });
  });
})();
