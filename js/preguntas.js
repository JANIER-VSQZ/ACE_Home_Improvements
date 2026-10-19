import { ready, t } from './i18n.js';

const contenedor = document.getElementById('faq-lista');
const buscador = document.getElementById('buscador');

function renderPreguntas() {
    const preguntas = t('preguntasFrecuentes', { returnObjects: true });
    const texto = buscador.value.trim().toLocaleLowerCase();
    const abiertas = new Set([...contenedor.querySelectorAll('[aria-expanded="true"]')]
        .map((button) => button.dataset.index));
    contenedor.replaceChildren();

    preguntas.forEach((item, index) => {
        if (!item.pregunta.toLocaleLowerCase().includes(texto)) return;
        const pregunta = document.createElement('div');
        pregunta.className = 'faq-item';
        const encabezado = document.createElement('button');
        encabezado.type = 'button';
        encabezado.className = 'faq-pregunta';
        encabezado.dataset.index = index;
        encabezado.setAttribute('aria-controls', `faq-respuesta-${index}`);
        const abierto = abiertas.has(String(index));
        encabezado.setAttribute('aria-expanded', String(abierto));

        const triangulo = document.createElement('span');
        triangulo.className = 'triangulo';
        triangulo.setAttribute('aria-hidden', 'true');
        triangulo.textContent = abierto ? '▼' : '▶';
        encabezado.append(triangulo, ` ${item.pregunta}`);

        const respuesta = document.createElement('div');
        respuesta.id = `faq-respuesta-${index}`;
        respuesta.className = 'faq-respuesta';
        respuesta.textContent = item.respuesta;
        respuesta.style.display = abierto ? 'block' : 'none';

        encabezado.addEventListener('click', () => {
            const expandir = encabezado.getAttribute('aria-expanded') !== 'true';
            encabezado.setAttribute('aria-expanded', String(expandir));
            respuesta.style.display = expandir ? 'block' : 'none';
            triangulo.textContent = expandir ? '▼' : '▶';
        });
        pregunta.append(encabezado, respuesta);
        contenedor.appendChild(pregunta);
    });

    if (!contenedor.childElementCount) {
        const mensaje = document.createElement('p');
        mensaje.textContent = t('faq.sinResultados');
        contenedor.appendChild(mensaje);
    }
}

ready.then(() => {
    buscador.addEventListener('input', renderPreguntas);
    document.addEventListener('languageChanged', renderPreguntas);
    renderPreguntas();
});
