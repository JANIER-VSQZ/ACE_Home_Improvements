export function initJobs() {
  const select = document.querySelector('#jobForm select[name="puesto"]');
  if (!select) return;
  const placeholder = document.querySelector('[data-job-placeholder]');
  const details = document.querySelectorAll('[data-job-details]');

  function showPosition() {
    details.forEach(detail => {
      detail.hidden = detail.dataset.jobDetails !== select.value;
    });
    placeholder.hidden = select.value !== '';
  }
  select.addEventListener('change', showPosition);
  showPosition();
}
