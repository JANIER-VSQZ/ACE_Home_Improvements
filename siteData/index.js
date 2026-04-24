import * as es from './pages/ES';
import * as en from './pages/EN';

function getLang() {
    if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        return params.get("lang") || "es";
    }
    return "es";
}

function context(page){
    const lang = getLang();
    const langData = lang === 'en' ? en : es;

    console.log("Getting context for:", page, "lang:", lang);

    let context = {
        title: lang === 'es' ? "Mi Sitio ABC" : "My Site ABC",
    };

    switch(page){
        case "/index.html":
            context = {
                ...context,
                ...langData.heroData,
                ...langData.testimoniosMainData
            };
            break;

        case '/cotizaciones.html':
            context = {
                ...context,
                ...langData.cotizacionData,
                ...langData.formularioData
            };
            break;

        case '/servicios.html':
            context = {
                ...context,
                ...langData.serviciosData
            };
            break;

        case '/proyectosDestacados.html':
            context = {
                ...context,
                ...langData.proyectosDestacadosData
            };
            break;

        case '/galeria.html':
            context = {
                ...context,
                ...langData.galeriaData
            };
            break;

        case '/mesaEmpleos.html':
            context = {
                ...context,
                ...langData.datosMesaEmpleos
            };
            break;

        case '/testimonios.html':
            context = {
                ...context,
                ...langData.testimoniosclienteData
            };
            break;
        case '/preguntasFrecuentes.html':
            context = {
                ...context,
                ...langData.faqData
            };
            break;
    }

    console.log("Context: ", JSON.stringify(context, null, 2));
    return context;
}

export default context;