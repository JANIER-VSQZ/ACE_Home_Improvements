export function initCarousel() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('[data-carousel]').forEach(carousel => {
    const slides = [...carousel.querySelectorAll('.carousel__slide')];
    if (slides.length < 2) return;
    let index = 0;
    window.setInterval(() => {
      if (document.hidden || reducedMotion.matches || carousel.matches(':hover, :focus-within')) return;
      slides[index].classList.remove('is-active');
      index = (index + 1) % slides.length;
      slides[index].classList.add('is-active');
    }, 4000);
  });
}
