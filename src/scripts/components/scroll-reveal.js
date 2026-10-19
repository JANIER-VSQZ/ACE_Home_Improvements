export function initScrollReveal() {
  const elements = [...document.querySelectorAll('[data-scroll-reveal]')];
  if (!elements.length || !('IntersectionObserver' in window)) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const revealed = new WeakSet();
  let observer;

  function show(element) {
    element.classList.add('is-reveal-visible');
    revealed.add(element);
    if (!element.hasAttribute('data-reveal-repeat')) observer?.unobserve(element);
  }

  function syncMotion() {
    observer?.disconnect();
    if (reducedMotion.matches) {
      elements.forEach(element => element.classList.remove('scroll-reveal'));
      return;
    }

    observer = new IntersectionObserver(entries => {
      entries.forEach(({ target, isIntersecting }) => {
        if (isIntersecting || target.contains(document.activeElement)) show(target);
        else if (target.hasAttribute('data-reveal-repeat')) target.classList.remove('is-reveal-visible');
      });
    }, { threshold: .05 });

    elements.forEach(element => {
      element.classList.add('scroll-reveal');
      element.classList.toggle('scroll-reveal--left', element.dataset.scrollReveal === 'left');
      if (revealed.has(element) && !element.hasAttribute('data-reveal-repeat')) return;
      element.classList.remove('is-reveal-visible');
      observer.observe(element);
    });
  }

  elements.forEach(element => {
    element.addEventListener('focusin', () => show(element));
  });
  reducedMotion.addEventListener('change', syncMotion);
  syncMotion();
}
