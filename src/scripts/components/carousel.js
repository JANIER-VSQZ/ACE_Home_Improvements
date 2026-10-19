export function initCarousel() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('[data-carousel]').forEach(carousel => {
    const slides = [...carousel.querySelectorAll('.carousel__slide')];
    if (slides.length < 2) return;
    let index = 0;
    window.setInterval(() => {
      if (document.hidden || reducedMotion.matches || carousel.matches(':hover, :focus-within')) return;
      slides[index].classList.remove('is-active');
      if (carousel.classList.contains('carousel--slide')) {
        const previous = slides[index];
        previous.classList.add('is-leaving');
        window.setTimeout(() => previous.classList.remove('is-leaving'), 650);
      }
      index = (index + 1) % slides.length;
      slides[index].classList.add('is-active');
    }, 3000);
  });
}
