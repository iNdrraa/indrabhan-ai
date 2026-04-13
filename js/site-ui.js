(function () {
  const btn = document.getElementById('nav-menu-btn');
  const menu = document.getElementById('mobile-menu');
  if (!btn || !menu) return;

  const openIcon = btn.querySelector('.nav-icon-open');
  const closeIcon = btn.querySelector('.nav-icon-close');

  function setOpen(open) {
    menu.classList.toggle('hidden', !open);
    menu.setAttribute('aria-hidden', String(!open));
    btn.setAttribute('aria-expanded', String(open));
    openIcon?.classList.toggle('hidden', open);
    closeIcon?.classList.toggle('hidden', !open);
    document.documentElement.classList.toggle('overflow-hidden', open);
  }

  btn.addEventListener('click', function () {
    setOpen(menu.classList.contains('hidden'));
  });

  menu.querySelectorAll('[data-close-nav]').forEach(function (el) {
    el.addEventListener('click', function () {
      setOpen(false);
    });
  });

  menu.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      setOpen(false);
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !menu.classList.contains('hidden')) setOpen(false);
  });
})();

(function () {
  var fab = document.querySelector('[data-scroll-contact]');
  if (!fab) return;
  fab.addEventListener('click', function (e) {
    var el = document.getElementById('contact');
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
})();
