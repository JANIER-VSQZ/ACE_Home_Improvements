export function initGallery() {
  const tabs = [...document.querySelectorAll('[data-gallery-tab]')];
  const panels = [...document.querySelectorAll('[data-gallery-panel]')];

  function selectTab(tab) {
    tabs.forEach(button => {
      const selected = button === tab;
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
    });
    panels.forEach(panel => {
      panel.hidden = panel.dataset.galleryPanel !== tab.dataset.galleryTab;
    });
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectTab(tab));
    tab.addEventListener('keydown', event => {
      const movement = { ArrowRight: 1, ArrowLeft: -1 };
      let next;
      if (event.key in movement) next = (index + movement[event.key] + tabs.length) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else return;
      event.preventDefault();
      selectTab(tabs[next]);
      tabs[next].focus();
    });
  });
}
