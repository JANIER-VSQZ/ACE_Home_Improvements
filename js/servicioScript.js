document.addEventListener('DOMContentLoaded', ()=>{
    const selected = new Set();
    const params = new URLSearchParams(window.location.search);
    const servicioParam = params.get('SRV');

    if (servicioParam) {
        const srvTarget = document.querySelector(`.carta-servicio[data-label="${servicioParam}"]`);
        console.log("SRV Param:", servicioParam, "Target:", srvTarget);
        if (srvTarget) {
            srvTarget.focus();
            console.log("Focused on:", srvTarget);
        }
    }
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                obs.unobserve(entry.target); 
            }/*else{
                entry.target.classList.remove("visible");
            }*/
        });
    });

    const divs = document.querySelectorAll(".carta-servicio");
    console.log(divs)
    divs.forEach(div=>{
        observer.observe(div);
    })
})