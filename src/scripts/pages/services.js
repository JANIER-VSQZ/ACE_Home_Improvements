export function initServices() {
  const service = new URLSearchParams(window.location.search).get('SRV');
  if (!service) return;
  const target = [...document.querySelectorAll('[data-service-name]')]
    .find(card => card.dataset.serviceName === service);
  target?.focus();
}
