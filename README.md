# ACE Home Improvement

Sitio de diez páginas con Vite, Handlebars, Less e i18next. Las URL públicas se conservan. Los formularios funcionan como demostración: validan los datos localmente y nunca envían solicitudes.

## Desarrollo

Requiere Node.js 22.15 o posterior.

```sh
npm ci
npm run dev
npm run check
npm test
npm run build
npm run test:browser
npm run preview
```

## Estructura

```text
*.html                      Entradas públicas: solo el layout y el parcial de página
src/
  data/
    site.js                 Registro de páginas, navegación y contexto de compilación
    assets.json             Imágenes y datos que no cambian con el idioma
    forms.json              Campos, secciones y opciones de formularios
  locales/
    es/translation.json     Contenido en español y texto inicial del HTML
    en/translation.json     Contenido en inglés
  partials/
    layouts/                Documento, head, cabecera y pie compartidos
    components/             Tarjetas, navegación y encabezados reutilizables
    forms/                  Formulario, campo y aviso de demostración
    pages/                  Composición de cada una de las diez páginas
  scripts/
    main.js                 Única entrada del navegador
    core/                   Inicialización y actualización del idioma
    components/             Navegación y carruseles
    forms/                  Reglas, mensajes y validación compartida
    pages/                  Comportamiento específico de cada página
  styles/
    main.less               Orden único de importación
    base/                   Variables, reset y tipografía
    layout/                 Contenedores, navegación y pie
    components/             Botones, formularios, tarjetas y carruseles
    pages/                  Distribución específica de cada página
public/images/              Imágenes estáticas
scripts/check-project.mjs   Comprobación de referencias y traducciones
scripts/check-browser.mjs   Pruebas de integración en navegador
tests/                      Pruebas de reglas de validación
```

La prueba de navegador necesita Chrome, Edge o Chromium. Si no está en una ubicación habitual, define `BROWSER_PATH` con la ruta del ejecutable. Comprueba las diez páginas en ambos idiomas, anchos de 320 a 1440 píxeles, navegación, formularios y contenido dinámico. Guarda capturas en `.artifacts/`, que no se versiona.

## Convenciones

### Dónde está el código anterior

| Antes | Ahora |
| --- | --- |
| `partials/` | `src/partials/layouts`, `components`, `forms` y `pages` |
| `less/principal.less` y `mejoras.less` | `src/styles/main.less` y módulos por responsabilidad |
| `js/cotizaciones.js` y `js/validarForm.js` | `src/scripts/forms/rules.js`, `validation.js` e `index.js` |
| `public/menu.js` y `public/hero.js` | `src/scripts/components/navigation.js` y `carousel.js` |
| `siteData/pages/` | `src/data/assets.json`, `forms.json` y `site.js` |
| `public/locales/` | `src/locales/` |

- Archivos y carpetas en inglés y kebab-case; textos del producto en los diccionarios.
- Indentación de dos espacios, UTF-8 y saltos de línea LF, definidos en `.editorconfig`.
- Parciales con su ruta completa: `{{> components/project-card}}`.
- Un `main` y un `h1` por página; el layout añade la cabecera y el pie.
- Clases por componente: `form__field`, `project-card__body`; variantes con `--` y estados con `is-`.
- JavaScript utiliza atributos `data-*` para los comportamientos; los estilos utilizan clases.
- Estilos por componente o página. El reset solo se define en `base/reset.less`.
- Colores, tipografías, radios y breakpoints se definen en `base/tokens.less`.
- No se escriben estilos en atributos HTML ni se añade código ejecutable a `public`.

## Traducciones

El HTML inicial se genera en español desde el mismo diccionario que utiliza i18next. El navegador incluye ambos idiomas en el bundle: no necesita CDN ni peticiones adicionales para cargar los textos.

```hbs
<h2 data-i18n="contacto.titulo">{{t "contacto.titulo"}}</h2>
<input data-i18n="[placeholder]faq.buscar" placeholder="{{t "faq.buscar"}}">
```

`t` genera el texto inicial. `data-i18n` actualiza texto o atributos al cambiar el idioma. No se aplica a un elemento que deba conservar hijos. Las claves de ambos diccionarios deben coincidir.

El idioma se guarda y se conserva en los enlaces. Se puede abrir una página con `?lang=es` o `?lang=en`. Los componentes que renderizan contenido dinámico pueden escuchar `languagechange`.

## Formularios

La estructura se configura en `src/data/forms.json`. Todos utilizan `forms/form.hbs` y `forms/field.hbs`. Las reglas se definen en `src/scripts/forms/rules.js` y la presentación de errores se comparte en `validation.js`.

Los mensajes se traducen, aparecen debajo del campo, se enlazan mediante `aria-describedby` y el primer error recibe el foco. Solo hay un formulario de empleo; un selector muestra los detalles del puesto elegido. Observaciones en cotizaciones es opcional.

Para implementar envíos reales en el futuro, sustituye el controlador de demostración en `src/scripts/forms/index.js` por una integración con un servidor. Nunca incluyas credenciales en el código del navegador.

## Efectos y animaciones

`src/scripts/components/scroll-reveal.js` anima las tarjetas con `data-scroll-reveal="left"` o `"right"` al entrar en pantalla. El atributo `data-reveal-repeat` permite repetir la entrada al volver a desplazarse hasta el elemento. Los estilos están en `src/styles/components/motion.less`.

Los carruseles cambian cada tres segundos. La portada utiliza `carousel--slide` para el desplazamiento horizontal y Acerca de Nosotros conserva el fundido. Las animaciones de entrada y el avance automático respetan la preferencia de movimiento reducido. Los carruseles se pausan al pasar el cursor o al cambiar de pestaña.

## Añadir una página

1. Registra su archivo, identificador y claves de título en `src/data/site.js`.
2. Crea `src/partials/pages/nombre.hbs` y la entrada HTML con el layout compartido.
3. Añade los textos a ambos diccionarios.
4. Si necesita comportamiento, crea un inicializador en `src/scripts/pages` y regístralo en `main.js`.
5. Si necesita estilos propios, impórtalos desde `src/styles/main.less`.
6. Ejecuta `npm run check`, `npm test` y `npm run build`.

## Publicación

`npm run build` genera `dist`. Vite usa `DEPLOY_BASE_URL` cuando se publica en una subcarpeta, por ejemplo `/ace/`. Las imágenes se resuelven con el helper `asset`, y los enlaces entre páginas conservan sus nombres originales.
