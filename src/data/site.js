import assets from './assets.json' with { type: 'json' };
import forms from './forms.json' with { type: 'json' };
import formDelivery from './form-delivery.json' with { type: 'json' };
import spanish from '../locales/es/translation.json' with { type: 'json' };

export const pages = [
  { file: 'index.html', id: 'home', titleKey: 'paginas.inicio', headingKey: 'hero.bienvenido', descriptionKey: 'hero.descripcion' },
  { file: 'servicios.html', id: 'services', titleKey: 'generalServicios.titulo', descriptionKey: 'generalServicios.descripcion', navKey: 'menu.servicios' },
  { file: 'proyectosDestacados.html', id: 'projects', titleKey: 'paginas.proyectos', headingKey: 'proyectos.titulo', descriptionKey: 'proyectos.descripcion', navKey: 'menu.proyectos' },
  { file: 'cotizaciones.html', id: 'quotes', titleKey: 'paginas.cotizaciones', descriptionKey: 'cotizaciones.descripcion', navKey: 'menu.cotizaciones' },
  { file: 'galeria.html', id: 'gallery', titleKey: 'paginas.galeria', descriptionKey: 'galeria.descripcion', navKey: 'menu.galeria' },
  { file: 'testimonios.html', id: 'testimonials', titleKey: 'paginas.testimonios', headingKey: 'testimonios.titulo', navKey: 'menu.testimonios' },
  { file: 'mesaEmpleos.html', id: 'jobs', titleKey: 'paginas.empleos', headingKey: 'empleos.titulo', descriptionKey: 'empleos.introduccion', navKey: 'menu.empleos' },
  { file: 'acercaNosotros.html', id: 'about', titleKey: 'paginas.acerca', headingKey: 'acercaNosotros.titulo', navKey: 'menu.acerca', secondary: true },
  { file: 'preguntasFrecuentes.html', id: 'faq', titleKey: 'paginas.preguntas', headingKey: 'faq.titulo', descriptionKey: 'faq.descripcion', navKey: 'menu.preguntas', secondary: true },
  { file: 'contactenos.html', id: 'contact', titleKey: 'paginas.contacto', headingKey: 'contacto.dudas', navKey: 'menu.contacto', secondary: true },
];

export function translate(key) {
  const value = key.split('.').reduce((parent, part) => parent?.[part], spanish);
  if (typeof value !== 'string') throw new Error('Missing Spanish translation: ' + key);
  return value;
}

export function assetUrl(path) {
  const base = process.env.DEPLOY_BASE_URL || './';
  return base.replace(/\/?$/, '/') + path.replace(/^\//, '');
}

export default function getPageContext(pathname) {
  const filename = pathname.split('?')[0].split('/').pop() || 'index.html';
  const page = pages.find(entry => entry.file === filename);
  if (!page) throw new Error('Unregistered page: ' + pathname);

  const navigation = pages.filter(entry => entry.navKey).map(entry => ({
    href: entry.file,
    key: entry.navKey,
    active: entry.id === page.id,
    secondary: Boolean(entry.secondary),
  }));
  const services = assets.services.map((entry, index) => ({
    ...spanish.servicios[index], ...entry, key: 'servicios.' + index,
    revealDirection: index % 2 === 0 ? 'left' : 'right',
    detailsHref: 'servicios.html?SRV=' + encodeURIComponent(entry.name),
    quoteHref: 'cotizaciones.html?boton=' + encodeURIComponent(entry.name),
  }));
  const projects = assets.projects.map((entry, index) => ({
    ...spanish.proyectos.items[index], ...entry, index, key: 'proyectos.items.' + index,
    summaryKey: 'inicio.resumenProyectos.' + index,
    href: 'proyectosDestacados.html#proyecto-' + index,
  }));
  const testimonials = assets.testimonials.map((entry, index) => ({
    ...entry, key: 'testimonios.items.' + index,
  }));
  const jobs = assets.jobs.map((entry, index) => ({
    ...spanish.empleos.items[index], ...entry, index, key: 'empleos.items.' + index,
  }));
  const gallery = Object.entries(assets.gallery).map(([id, images]) => ({
    id, hidden: id !== 'work',
    labelKey: id === 'work' ? 'galeria.imagenes' : 'galeria.herramientas',
    images: images.map((image, index) => ({
      image, key: 'galeria.items.' + id + '.' + index,
    })),
  }));

  return {
    page: { ...page, headingKey: page.headingKey || page.titleKey },
    primaryNavigation: navigation.filter(entry => !entry.secondary),
    secondaryNavigation: navigation.filter(entry => entry.secondary),
    heroImages: assets.hero,
    services, projects, testimonials, jobs, gallery,
    featuredTestimonials: testimonials.slice(0, 3),
    forms: Object.fromEntries(Object.entries(forms).map(([type, form]) => [
      type, { ...form, endpoint: formDelivery.endpoint },
    ])),
  };
}
