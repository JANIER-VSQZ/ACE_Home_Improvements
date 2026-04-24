document.addEventListener('DOMContentLoaded', () => {
    const nav = document.querySelector('.navegacion');
    const toggle = nav.querySelector('.menu-toggle');
    const dropdown = nav.querySelector('.dropdown');
    const dropdownToggle = nav.querySelector('.dropdown-toggle');

    window.setLang = function (lang) {
                    localStorage.setItem('lang', lang);
                    window.location.href = `?lang=${lang}`;
                }

    toggle.addEventListener('click', () => {
        const menu = nav.querySelector('.menu');
        menu.classList.toggle('open');
    });

    dropdownToggle.addEventListener('click', (e) => {
        e.preventDefault();
        dropdown.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target) && !dropdownToggle.contains(e.target)) {
            dropdown.classList.remove('open');
        }
    });
});