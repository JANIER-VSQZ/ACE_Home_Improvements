export function initNavigation() {
  const navigation = document.querySelector('[data-navigation]');
  if (!navigation) return;
  const menu = navigation.querySelector('[data-menu]');
  const toggle = navigation.querySelector('[data-menu-toggle]');
  const dropdown = navigation.querySelector('[data-dropdown]');
  const dropdownToggle = navigation.querySelector('[data-dropdown-toggle]');

  function setOpen(element, button, open) {
    element.classList.toggle('is-open', open);
    button.setAttribute('aria-expanded', String(open));
  }

  toggle.addEventListener('click', () => {
    setOpen(menu, toggle, toggle.getAttribute('aria-expanded') !== 'true');
  });
  dropdownToggle.addEventListener('click', () => {
    setOpen(dropdown, dropdownToggle, dropdownToggle.getAttribute('aria-expanded') !== 'true');
  });
  document.addEventListener('click', event => {
    if (!dropdown.contains(event.target)) setOpen(dropdown, dropdownToggle, false);
    if (!navigation.contains(event.target)) setOpen(menu, toggle, false);
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    if (dropdown.classList.contains('is-open')) {
      setOpen(dropdown, dropdownToggle, false);
      dropdownToggle.focus();
    } else if (menu.classList.contains('is-open')) {
      setOpen(menu, toggle, false);
      toggle.focus();
    }
  });
  window.matchMedia('(min-width: 1100px)').addEventListener('change', () => {
    setOpen(menu, toggle, false);
    setOpen(dropdown, dropdownToggle, false);
  });
}
