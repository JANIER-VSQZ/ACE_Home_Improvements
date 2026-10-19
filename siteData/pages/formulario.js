export default {
    formCotizacion:
    {
        frmId: "frmCotizacion",
        formAction: "cotizaciones.html",
        secciones: [
            {
                descripcionSeccion: "Informacion general del servicio",
                campos: [
                    {
                        label: "Área aproximada",
                        id: "txtDimensiones",
                        type: "Text",
                        name: "Dimensiones",
                        placeholder: "Ej. 120.5",
                        title: "Indica el área aproximada y selecciona la unidad.",
                        inputmode: "decimal",
                        unidades: true,
                        required: true
                    },
                    {
                        label: "Condicion Actual",
                        id: "txtCondicion",
                        type: "Text",
                        name: "Condicion",
                        placeholder: "Condicion actual de la residencia.",
                        title: "condicion en la que se encuentra el lugar de trabajo.",
                        required: true
                    },
                    {
                        label: "Ciudad o código postal",
                        id: "txtUbicacion",
                        type: "Text",
                        name: "Ubicacion",
                        placeholder: "Ciudad o código postal del proyecto.",
                        title: "Para consultar disponibilidad en tu zona.",
                        autocomplete: "address-level2",
                        required: true
                    },
                    {
                        label: "Observaciones (opcional)",
                        id: "txtObservacion",
                        type: "Text",
                        name: "Observacion",
                        placeholder: "Detalles importantes.",
                        title: "Detalles importantes que le gustaria añadir.",
                        multilinea: true,
                        required: false
                    },
                ]
            },
            {
                descripcionSeccion: "Informacion personal",
                campos: [
                    {
                        label: "Nombre",
                        id: "txtNombre",
                        type: "Text",
                        name: "Nombre",
                        autocomplete: "given-name",
                        placeholder: "Nombre del solicitante.",
                        title: "Nombre del solicitante.",
                        required: true
                    },
                    {
                        label: "Apellido",
                        id: "txtApellido",
                        type: "Text",
                        name: "Apellido",
                        autocomplete: "family-name",
                        placeholder: "Apellido del solicitante.",
                        title: "Apellido del solicitante.",
                        required: true
                    },
                    {
                        label: "Correo Electronico",
                        id: "txtCorreo",
                        type: "Email",
                        name: "Correo",
                        autocomplete: "email",
                        placeholder: "Correo Electronico del solicitante.",
                        title: "Correo Electronico del solicitante.",
                        required: true
                    },
                    {
                        label: "Telefono",
                        id: "txtTelefono",
                        type: "tel",
                        name: "Telefono",
                        autocomplete: "tel",
                        placeholder: "Numero de telefono del solicitante.",
                        title: "Numero de telefono del solicitante.",
                        required: true
                    },
                ]
            },
            {
                boton: "ENVIAR"
            }
        ]
    },
}
