(function () {
  'use strict';

  function fetchJSON(url) {
    return fetch(url, { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error('Failed to load ' + url);
      return r.json();
    });
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

  function renderSpeakers(list) {
    var el = document.querySelector('[data-speakers]');
    if (!el) return;
    if (!list || !list.length) { el.innerHTML = '<p class="muted">Speakers coming soon.</p>'; return; }
    el.innerHTML = list.map(function (s) {
      var img = s.photo
        ? '<img src="' + escapeHtml(s.photo) + '" alt="' + escapeHtml(s.name) + '" loading="lazy" />'
        : '<img alt="" />';
      var link = s.url
        ? '<a href="' + escapeHtml(s.url) + '" rel="noopener">' + escapeHtml(s.name) + '</a>'
        : escapeHtml(s.name);
      return '<article class="speaker">' + img +
        '<h3>' + link + '</h3>' +
        '<p>' + escapeHtml(s.title || '') + '</p></article>';
    }).join('');
    setStat('speakers', list.length);
  }

  function renderSchedule(data) {
    var el = document.querySelector('[data-schedule]');
    if (!el) return;
    var items = (data && data.items) || [];
    if (!items.length) { el.innerHTML = '<p class="muted">Schedule coming soon.</p>'; return; }
    var sessions = 0;
    el.innerHTML = items.map(function (it) {
      if (it.type === 'break') {
        return '<div class="schedule-item break"><div class="time">' + escapeHtml(it.time) +
          '</div><div><h3>' + escapeHtml(it.title) + '</h3></div></div>';
      }
      sessions++;
      var room = it.room ? '<span class="room">' + escapeHtml(it.room) + '</span>' : '';
      var speaker = it.speaker ? '<div class="speaker-name">' + escapeHtml(it.speaker) + '</div>' : '';
      return '<div class="schedule-item"><div class="time">' + escapeHtml(it.time) +
        '</div><div><h3>' + escapeHtml(it.title) + room + '</h3>' + speaker + '</div></div>';
    }).join('');
    setStat('sessions', sessions);
  }

  function renderSponsors(list) {
    var el = document.querySelector('[data-sponsors]');
    if (!el) return;
    if (!list || !list.length) { el.innerHTML = '<p class="muted">Sponsors coming soon.</p>'; return; }
    el.innerHTML = list.map(function (s) {
      var img = s.logo
        ? '<img src="' + escapeHtml(s.logo) + '" alt="' + escapeHtml(s.name) + '" loading="lazy" />'
        : '<span>' + escapeHtml(s.name) + '</span>';
      return '<a href="' + escapeHtml(s.url || '#') + '" rel="noopener" title="' + escapeHtml(s.name) + '">' + img + '</a>';
    }).join('');
  }

  function setStat(key, value) {
    document.querySelectorAll('[data-stat="' + key + '"]').forEach(function (el) { el.textContent = value; });
  }

  /**
   * Populate event-specific text/branding from data/event.json so the same
   * template can be reused for other events without touching index.html.
   */
  function applyEvent(cfg) {
    if (!cfg) return;
    var name = cfg.name || 'Event';
    var shortName = cfg.shortName || name;
    var desc = cfg.description || '';
    var lead = (cfg.tagline ? cfg.tagline + ' ' : '') + desc;
    var t = cfg.titleParts || {};

    document.title = name;
    setText('[data-event-title]', name);
    setAttr('[data-event-meta-desc]', 'content', desc);
    setAttr('[data-event-og-title]', 'content', name);
    setAttr('[data-event-og-desc]', 'content', desc);
    if (cfg.ogImage) setAttr('[data-event-og-image]', 'content', cfg.ogImage);

    setText('[data-event-brand]', '');
    document.querySelectorAll('[data-event-brand]').forEach(function (el) {
      if (t.before || t.accent || t.after) {
        el.innerHTML = escapeHtml(t.before || '') +
          (t.accent ? ' <strong>' + escapeHtml(t.accent) + '</strong>' : '') +
          (t.after ? ' ' + escapeHtml(t.after) : '');
      } else {
        el.textContent = name;
      }
    });
    setAttr('[data-event-brand-aria]', 'aria-label', name + ' home');

    setText('[data-event-eyebrow]', cfg.eyebrow || '');
    setText('[data-event-title-before]', t.before || '');
    setText('[data-event-title-accent]', t.accent || '');
    setText('[data-event-title-after]', t.after || '');
    setText('[data-event-lead]', lead.trim());

    var when = [cfg.date, cfg.time].filter(Boolean).join(' · ');
    setText('[data-event-when]', when);
    var where = [cfg.venue, cfg.address].filter(Boolean).join(', ');
    setText('[data-event-where]', where);

    setText('[data-event-short]', shortName);

    var about = document.querySelector('[data-event-about]');
    if (about && Array.isArray(cfg.aboutHtml)) {
      about.innerHTML = cfg.aboutHtml.map(function (p) { return '<p>' + p + '</p>'; }).join('');
    }

    var footerExtra = document.querySelector('[data-event-footer-extra]');
    if (footerExtra) {
      var parts = [];
      if (cfg.parentEvent && cfg.parentEvent.url && cfg.parentEvent.name) {
        parts.push('Part of the <a href="' + escapeHtml(cfg.parentEvent.url) +
          '" rel="noopener">' + escapeHtml(cfg.parentEvent.name) + '</a>.');
      }
      if (cfg.repoUrl) {
        parts.push('Source on <a href="' + escapeHtml(cfg.repoUrl) + '" rel="noopener">GitHub</a>.');
      }
      footerExtra.innerHTML = parts.join(' ');
    }

    // Apply default theme/accent if the user hasn't picked one yet.
    try {
      var hasTheme = localStorage.getItem('ac-theme');
      var hasAccent = localStorage.getItem('ac-accent');
      if (!hasTheme && cfg.theme && cfg.theme.mode) {
        document.documentElement.dataset.theme = cfg.theme.mode;
      }
      if (!hasAccent && cfg.theme && cfg.theme.accent) {
        document.documentElement.dataset.accent = cfg.theme.accent;
      }
    } catch (e) {}

    // Hide sections disabled in the config.
    var sections = cfg.sections || {};
    Object.keys(sections).forEach(function (key) {
      if (sections[key] === false) {
        document.querySelectorAll('[data-section-wrap="' + key + '"]').forEach(function (el) {
          el.style.display = 'none';
        });
        document.querySelectorAll('.primary-nav [data-section="' + key + '"]').forEach(function (el) {
          el.style.display = 'none';
        });
      }
    });
  }

  function setText(selector, value) {
    document.querySelectorAll(selector).forEach(function (el) { el.textContent = value; });
  }
  function setAttr(selector, attr, value) {
    document.querySelectorAll(selector).forEach(function (el) { el.setAttribute(attr, value); });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var y = document.querySelector('[data-year]');
    if (y) y.textContent = new Date().getFullYear();

    var navToggle = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('.primary-nav');
    if (navToggle && nav) {
      navToggle.addEventListener('click', function () {
        var open = nav.classList.toggle('open');
        navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      nav.addEventListener('click', function (e) {
        if (e.target.tagName === 'A') {
          nav.classList.remove('open');
          navToggle.setAttribute('aria-expanded', 'false');
        }
      });
    }

    fetchJSON('data/event.json').then(applyEvent).catch(function () {});
    fetchJSON('data/speakers.json').then(renderSpeakers).catch(function () {});
    fetchJSON('data/schedule.json').then(renderSchedule).catch(function () {});
    fetchJSON('data/sponsors.json').then(renderSponsors).catch(function () {});
    fetchJSON('data/slides.json').then(renderSlides).catch(function () {});
  });

  function renderSlides(list) {
    var el = document.querySelector('[data-slides]');
    if (!el) return;
    if (!list || !list.length) {
      el.innerHTML = '<p class="muted">Slides will appear here once speakers share them. ' +
        'Drop PDFs or PPTX in <code>slides/</code> and add entries to <code>data/slides.json</code>.</p>';
      setStat('slides', 0);
      return;
    }
    el.innerHTML = list.map(function (s, i) {
      var primary = s.file || s.url;
      if (!primary) return '';
      var tags = (s.tags || []).map(function (t) {
        return '<span class="tag">' + escapeHtml(t) + '</span>';
      }).join('');
      var ext = '';
      if (s.file && /\.pdf$/i.test(s.file)) ext = 'PDF';
      else if (s.file) ext = s.file.split('.').pop().toUpperCase();
      else if (s.url) ext = 'LINK';

      // Preview image: explicit s.preview wins; otherwise try slides/previews/<stem>.png.
      var preview = s.preview || defaultPreviewPath(s.file);
      var thumbInner;
      if (preview) {
        thumbInner = '<img src="' + encodeURI(preview) + '" alt="" loading="lazy" ' +
          'onerror="this.parentNode.classList.add(\'no-preview\');this.remove();" />' +
          '<span class="slide-badge">' + escapeHtml(ext) + '</span>';
      } else {
        thumbInner = '<span class="slide-badge">' + escapeHtml(ext) + '</span>';
      }

      var actions = '';
      if (canEmbed(s)) {
        actions += '<button type="button" class="btn btn-primary btn-sm" data-slide-view="' + i + '">View</button>';
      } else if (s.url && !s.file) {
        actions += '<a class="btn btn-primary btn-sm" href="' + escapeHtml(s.url) +
          '" target="_blank" rel="noopener">Open</a>';
      }
      if (s.file) {
        actions += '<a class="btn btn-ghost btn-sm" href="' + encodeURI(s.file) + '" download>Download</a>';
      }
      if (s.url && s.file) {
        actions += '<a class="btn btn-ghost btn-sm" href="' + escapeHtml(s.url) +
          '" target="_blank" rel="noopener">View online</a>';
      }

      return '<article class="slide-card">' +
        '<button type="button" class="slide-thumb' + (preview ? '' : ' no-preview') + '" ' +
          (canEmbed(s) ? 'data-slide-view="' + i + '"' : 'disabled') +
          ' aria-label="Open preview">' + thumbInner + '</button>' +
        '<div class="slide-body">' +
          '<h3>' + escapeHtml(s.title || 'Untitled') + '</h3>' +
          (s.speaker ? '<p class="speaker-name">' + escapeHtml(s.speaker) + '</p>' : '') +
          (s.description ? '<p class="muted">' + escapeHtml(s.description) + '</p>' : '') +
          (tags ? '<div class="tags">' + tags + '</div>' : '') +
          '<div class="slide-actions">' + actions + '</div>' +
        '</div>' +
      '</article>';
    }).join('');
    setStat('slides', list.length);
    wireSlideViewer(list);
  }

  /**
   * Returns the conventional preview path for a local slide file:
   * slides/foo.pdf -> slides/previews/foo.png
   */
  function defaultPreviewPath(file) {
    if (!file) return '';
    var slash = file.lastIndexOf('/');
    var dir = slash >= 0 ? file.slice(0, slash) : '';
    var name = slash >= 0 ? file.slice(slash + 1) : file;
    var dot = name.lastIndexOf('.');
    var stem = dot >= 0 ? name.slice(0, dot) : name;
    return (dir ? dir + '/' : '') + 'previews/' + stem + '.png';
  }

  function isPdf(s) { return s.file && /\.pdf$/i.test(s.file); }
  function isPptx(s) { return s.file && /\.(pptx?|key|odp)$/i.test(s.file); }
  function canEmbed(s) { return isPdf(s) || isPptx(s); }

  function absoluteUrl(relativePath) {
    var base = window.location.origin + window.location.pathname.replace(/[^/]*$/, '');
    return base + relativePath;
  }

  function viewerSrc(s) {
    if (isPdf(s)) return encodeURI(s.file) + '#view=FitH';
    if (isPptx(s)) {
      return 'https://view.officeapps.live.com/op/embed.aspx?src=' +
        encodeURIComponent(absoluteUrl(s.file));
    }
    return '';
  }

  function wireSlideViewer(list) {
    var dlg = document.querySelector('[data-slide-viewer]');
    if (!dlg) return;
    var frame = dlg.querySelector('iframe');
    var title = dlg.querySelector('[data-sv-title]');
    var dlBtn = dlg.querySelector('[data-sv-download]');
    var openBtn = dlg.querySelector('[data-sv-open]');
    var closeBtn = dlg.querySelector('[data-sv-close]');

    function open(i) {
      var s = list[i];
      if (!s || !canEmbed(s)) return;
      frame.src = viewerSrc(s);
      title.textContent = s.title || '';
      dlBtn.style.display = s.file ? '' : 'none';
      if (s.file) dlBtn.href = encodeURI(s.file);
      openBtn.style.display = s.url ? '' : 'none';
      if (s.url) openBtn.href = s.url;
      if (typeof dlg.showModal === 'function') {
        if (!dlg.open) dlg.showModal();
      } else {
        dlg.setAttribute('open', '');
      }
    }
    function close() { frame.src = 'about:blank'; if (dlg.open) dlg.close(); }

    document.querySelectorAll('[data-slide-view]').forEach(function (btn) {
      btn.addEventListener('click', function () { open(parseInt(btn.dataset.slideView, 10)); });
    });
    closeBtn.addEventListener('click', close);
    dlg.addEventListener('click', function (e) { if (e.target === dlg) close(); });
    dlg.addEventListener('close', function () { frame.src = 'about:blank'; });
  }
})();
