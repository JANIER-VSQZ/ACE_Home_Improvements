# ACE Home Improvement

Sitio de diez páginas con Vite, Handlebars, Less e i18next. Las URL públicas se conservan. Los formularios validan los datos y los envían por correo mediante FormSubmit, compatible con GitHub Pages.

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
    form-delivery.json      Endpoint público para el envío de los tres formularios
  locales/
    es/translation.json     Contenido en español y texto inicial del HTML
    en/translation.json     Contenido en inglés
  partials/
    layouts/                Documento, head, cabecera y pie compartidos
    components/             Tarjetas, navegación y encabezados reutilizables
    forms/                  Formulario, campo y estado de envío
    pages/                  Composición de cada una de las diez páginas
  scripts/
    main.js                 Única entrada del navegador
    core/                   Inicialización y actualización del idioma
    components/             Navegación y carruseles
    forms/                  Reglas, validación y envío compartido
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
tests/                      Pruebas de validación y transporte de formularios
```

La prueba de navegador necesita Chrome, Edge o Chromium. Si no está en una ubicación habitual, define `BROWSER_PATH` con la ruta del ejecutable. Comprueba las diez páginas en ambos idiomas, anchos de 320 a 1440 píxeles, navegación, formularios y contenido dinámico. Intercepta las solicitudes a FormSubmit para simular respuestas: las pruebas automáticas no envían correos. Guarda capturas en `.artifacts/`, que no se versiona.

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

El destino de contacto, cotizaciones y empleo se configura una sola vez en `src/data/form-delivery.json`. Está preparado para `vasquezjanier31@gmail.com` mediante `https://formsubmit.co/ajax/vasquezjanier31@gmail.com`. No se necesitan contraseñas ni claves privadas. El endpoint es público.

`src/scripts/forms/submission.js` prepara los campos con sus etiquetas traducidas, el puesto y la unidad seleccionados, el servicio solicitado en una cotización y el correo del remitente para poder responder. Cada tipo de solicitud tiene un asunto distinto. El controlador muestra el progreso, bloquea envíos simultáneos y solo limpia el formulario si FormSubmit confirma que aceptó la solicitud. Ante un error conserva los datos. No reintenta automáticamente un envío que agota el tiempo de espera, porque podría haberse recibido.

### Activar la recepción

1. Publica los cambios en GitHub Pages o abre el sitio con `npm run dev` o `npm run preview`.
2. Completa y envía un formulario con datos de prueba.
3. Revisa `vasquezjanier31@gmail.com`, incluida la carpeta de spam, y confirma el enlace **Activate Form** enviado por FormSubmit. Activa los formularios que el proveedor solicite; puede volver a pedirlo al cambiar de página o dominio.
4. Vuelve a enviar una prueba y comprueba que llega con los datos y el asunto correspondientes.

Antes de la activación, el proveedor puede pedir confirmar el correo en vez de entregar el mensaje. La aplicación comprueba tanto el estado HTTP como el resultado de la respuesta; no considera correcto un envío rechazado. La recepción final en Gmail requiere esta activación y comprobar el buzón.

Los envíos manuales desde desarrollo también son reales. Para comprobar el comportamiento sin correos, utiliza `npm test` y, después de compilar, `npm run test:browser`. [Documentación de FormSubmit](https://formsubmit.co/documentation) y [activación y ayuda](https://formsubmit.co/help).

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

`npm run build` genera `dist` con rutas relativas para que los estilos y las imágenes funcionen desde la raíz o desde una subcarpeta. Si defines `DEPLOY_BASE_URL`, por ejemplo `/ace/`, se usa esa ruta explícita. Las imágenes se resuelven con el helper `asset`, y los enlaces entre páginas conservan sus nombres originales.

Para revisar el compilado localmente, ejecuta `npm run preview` y abre la dirección que muestra Vite, normalmente `http://localhost:4173`. Sirve toda la carpeta `dist`, incluidos `assets` e `images`. Abrir el archivo HTML con doble clic no permite ejecutar correctamente los módulos JavaScript del sitio.
