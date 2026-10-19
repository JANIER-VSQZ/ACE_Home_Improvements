document.addEventListener('DOMContentLoaded', () => {
    const nav = document.querySelector('.navegacion');
    const toggle = nav.querySelector('.menu-toggle');
    const dropdown = nav.querySelector('.dropdown');
    const dropdownToggle = nav.querySelector('.dropdown-toggle');

    toggle.addEventListener('click', () => {
        const menu = nav.querySelector('.menu');
        menu.classList.toggle('open');
        toggle.setAttribute('aria-expanded', String(menu.classList.contains('open')));
    });

    dropdownToggle.addEventListener('click', (e) => {
        e.preventDefault();
        dropdown.classList.toggle('open');
        dropdownToggle.setAttribute('aria-expanded', String(dropdown.classList.contains('open')));
    });

    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target) && !dropdownToggle.contains(e.target)) {
            dropdown.classList.remove('open');
            dropdownToggle.setAttribute('aria-expanded', 'false');
        }
    });
    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') return;
        const dropdownAbierto = dropdown.classList.contains('open');
        dropdown.classList.remove('open');
        dropdownToggle.setAttribute('aria-expanded', 'false');
        if (dropdownAbierto) dropdownToggle.focus();
        else {
            nav.querySelector('.menu').classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
            if (getComputedStyle(toggle).display !== 'none') toggle.focus();
        }
    });
});
