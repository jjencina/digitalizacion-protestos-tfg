// Configuración para la vista de Análisis (charts/mapa/tabla)
const AnalisisConfig = {
  protestos: {
    endpoint: '/protesto',
    title: 'Protestos',
    keyField: 'id_protesto',
    dateField: 'fecha_protesto',
    numberField: 'importe',
    locationField: 'ciudad_nombre',
    categoryFields: ['tipo_protesto_nombre', 'tipo_letra_protesto_nombre'],
    tableFields: [
      {field: 'id_protesto', title: 'ID', width: '60px'},
      {field: 'fecha_protesto', title: 'Fecha', width: '100px', format: 'date'},
      {field: 'importe', title: 'Importe', width: '100px', format: 'number'},
      {field: 'moneda_nombre', title: 'Moneda', width: '100px'},
      {field: 'ciudad_nombre', title: 'Ciudad', width: '120px'},
      {field: 'tipo_letra_protesto_nombre', title: 'Tipo Letra', width: '120px'},
      {field: 'tipo_protesto_nombre', title: 'Tipo Protesto', width: '120px'},
      {field: 'motivo', title: 'Motivo', width: '180px'}
    ]
  },
  letras: {
    endpoint: '/letra',
    title: 'Letras de Cambio',
    keyField: 'id_letra',
    dateField: 'fecha_letra',
    numberField: 'importe',
    locationField: 'ciudad_nombre',
    categoryFields: ['tipo_letra_nombre', 'tipo_valor_nombre'],
    tableFields: [
      {field: 'id_letra', title: 'ID', width: '60px'},
      {field: 'fecha_letra', title: 'Fecha Emisión', width: '100px', format: 'date'},
      {field: 'fecha_vencimiento', title: 'Vencimiento', width: '120px'},
      {field: 'importe', title: 'Importe', width: '100px', format: 'number'},
      {field: 'moneda_nombre', title: 'Moneda', width: '100px'},
      {field: 'ciudad_nombre', title: 'Ciudad', width: '120px'},
      {field: 'tipo_letra_nombre', title: 'Tipo Letra', width: '120px'},
      {field: 'tipo_valor_nombre', title: 'Valor', width: '120px'}
    ]
  },
  endosos: {
    endpoint: '/endoso',
    title: 'Endosos',
    keyField: 'id_endoso',
    dateField: 'fecha_endoso',
    numberField: 'valor',
    locationField: 'ciudad_nombre',
    categoryFields: ['tipo_negociacion_nombre'],
    tableFields: [
      {field: 'id_endoso', title: 'ID', width: '60px'},
      {field: 'fecha_endoso', title: 'Fecha', width: '100px', format: 'date'},
      {field: 'valor', title: 'Valor', width: '100px', format: 'number'},
      {field: 'moneda_nombre', title: 'Moneda', width: '100px'},
      {field: 'ciudad_nombre', title: 'Ciudad', width: '120px'},
      {field: 'tipo_negociacion_nombre', title: 'Tipo Negociación', width: '150px'}
    ]
  },
  personas: {
    endpoint: '/personas',
    title: 'Personas',
    keyField: 'id_persona',
    dateField: null,
    numberField: null,
    locationField: null,
    categoryFields: [],
    tableFields: [
      {field: 'id_persona', title: 'ID', width: '60px'},
      {field: 'nombre', title: 'Nombre', width: '150px'},
      {field: 'apellidos', title: 'Apellidos', width: '150px'},
      {field: 'profesion', title: 'Profesión', width: '120px'}
    ]
  },
  ciudades: {
    endpoint: '/ciudades',
    title: 'Ciudades',
    keyField: 'id_ciudad',
    dateField: null,
    numberField: null,
    locationField: 'nombre_ciudad',
    categoryFields: [],
    tableFields: [
      {field: 'id_ciudad', title: 'ID', width: '60px'},
      {field: 'nombre_ciudad', title: 'Ciudad', width: '200px'},
      {field: 'pais', title: 'País', width: '150px'}
    ]
  },
  todos: {
    endpoint: '/todos',
    title: 'Todos',
    keyField: 'id',
    dateField: 'fecha',
    numberField: 'importe',
    locationField: 'ciudad_nombre',
    categoryFields: ['tipo_entidad', 'moneda_nombre', 'tipo_protesto_nombre', 'tipo_letra_nombre', 'tipo_valor_nombre'],
    tableFields: [
      { field: 'tipo_entidad', title: 'Entidad', width: '110px' },
      { field: 'id', title: 'ID', width: '70px' },
      { field: 'fecha', title: 'Fecha', width: '110px', format: 'date' },
      { field: 'importe', title: 'Importe/Valor', width: '130px', format: 'number' },
      { field: 'moneda_nombre', title: 'Moneda', width: '100px' },
      { field: 'ciudad_nombre', title: 'Ciudad', width: '140px' },
      { field: 'tipo_detalle', title: 'Tipo', width: '150px' },
      { field: 'roles_count', title: 'Roles', width: '80px' },
      { field: 'relaciones_count', title: 'Relaciones', width: '110px' }
    ]
  }
};

// Configuración para la vista de Consultar (CRUD/tablas/formularios)
const CrudConfig = {
  protestos: {
    title: "Protestos",
    columns: [
      {title: "ID", field: "id_protesto", width: "80px"},
      {title: "Fecha", field: "fecha_protesto", width: "120px", format: "date"},
      {title: "Archivo", field: "archivo", width: "100px"},
      {title: "Protocolo", field: "protocolo", width: "100px"},
      {title: "Página", field: "pagina", width: "80px"},
      {title: "Ciudad", field: "ciudad_nombre", width: "120px"},
      {title: "Tipo Letra", field: "tipo_letra_protesto_nombre", width: "120px"},
      {title: "Tipo Protesto", field: "tipo_protesto_nombre", width: "120px"},
      {title: "Motivo", field: "motivo", width: "150px"},
      {title: "Acciones", field: "_actions", width: "120px"}
    ],
    endpoint: "/protesto",
    formFields: [
      {name: "fecha_protesto", label: "Fecha Protesto", type: "date", required: true},
      {name: "archivo", label: "Archivo", type: "text", required: false},
      {name: "protocolo", label: "Protocolo", type: "text", required: false},
      {name: "pagina", label: "Página", type: "text", required: false},
      {name: "id_ciudad", label: "Ciudad", type: "select", endpoint: "/ciudades", valueField: "id_ciudad", displayField: "nombre_ciudad", required: false},
      {name: "id_tipo_letra", label: "Tipo Letra", type: "select", endpoint: "/letra/tipos/letra", valueField: "id_tipo_letra", displayField: "nombre", required: false},
      {name: "id_tipo_protesto", label: "Tipo Protesto", type: "select", endpoint: "/protesto/tipos/protestos", valueField: "id_tipo_protesto", displayField: "nombre", required: false},
      {name: "motivo", label: "Motivo", type: "textarea", required: false},
      {name: "introduccion", label: "Introducción", type: "textarea", required: false},
      {name: "fuente", label: "Fuente", type: "text", required: false},
      {name: "importe", label: "Importe", type: "number", step: "0.01", required: false},
      {name: "id_moneda", label: "Moneda", type: "select", endpoint: "/monedas", valueField: "id_moneda", displayField: "nombre_moneda", required: false}
    ]
  },
  letras: {
    columns: [
      {title: "#", field: "id_letra", width: "80px"},
      {title: "Fecha Emisión", field: "fecha_letra", width: "120px", format: "date"},
      {title: "Vencimiento", field: "fecha_vencimiento", width: "120px"},
      {title: "Importe", field: "importe", width: "100px"},
      {title: "Moneda", field: "nombre_moneda", width: "100px"},
      {title: "Tipo", field: "tipo_letra_nombre", width: "120px"},
      {title: "Ciudad", field: "nombre_ciudad", width: "100px"},
      {title: "Acciones", field: "_actions", width: "120px"}
    ],
    endpoint: "/letra",
    formFields: [
      {name: "fecha_letra", label: "Fecha Emisión", type: "date", required: true},
      {name: "fecha_vencimiento", label: "Fecha Vencimiento", type: "text", required: false},
      {name: "importe", label: "Importe", type: "text", required: true},
      {name: "id_moneda", label: "Moneda", type: "select", endpoint: "/monedas", valueField: "id_moneda", displayField: "nombre_moneda", required: true},
      {name: "id_tipo_letra", label: "Tipo de Letra", type: "select", endpoint: "/letra/tipos/letra", valueField: "id_tipo_letra", displayField: "nombre", required: true},
      {name: "id_ciudad", label: "Ciudad", type: "select", endpoint: "/ciudades", valueField: "id_ciudad", displayField: "nombre_ciudad", required: false},
      {name: "id_tipo_plazo", label: "Tipo Plazo", type: "select", endpoint: "/letra/tipos/plazo", valueField: "id_tipo_plazo", displayField: "nombre", required: false},
      {name: "id_tipo_valor", label: "Tipo Valor", type: "select", endpoint: "/letra/tipos/valor", valueField: "id_tipo_valor", displayField: "nombre", required: false},
      {name: "plazo_dias", label: "Plazo en Días", type: "number", required: false},
      {name: "texto_indicacion", label: "Texto Indicación", type: "textarea", required: false},
      {name: "comentarios", label: "Comentarios", type: "textarea", required: false},
      {name: "uso", label: "Uso", type: "text", required: false}
    ]
  },
  endosos: {
    columns: [
      {title: "#", field: "id_endoso", width: "80px"},
      {title: "Fecha", field: "fecha_endoso", width: "100px", format: "date"},
      {title: "Valor", field: "valor", width: "100px"},
      {title: "Moneda", field: "moneda_nombre", width: "100px"},
      {title: "Tipo Neg.", field: "tipo_negociacion_nombre", width: "120px"},
      {title: "Ciudad", field: "ciudad_nombre", width: "100px"},
      {title: "Tipo Valor", field: "tipo_valor_nombre", width: "100px"},
      {title: "Letras", field: "letras_relacionadas", width: "150px"},
      {title: "Acciones", field: "_actions", width: "120px"}
    ],
    endpoint: "/endoso",
    formFields: [
      {name: "fecha_endoso", label: "Fecha", type: "date", required: true},
      {name: "valor", label: "Valor", type: "text", required: true},
      {name: "id_moneda", label: "Moneda", type: "select", endpoint: "/monedas", valueField: "id_moneda", displayField: "nombre_moneda", required: true},
      {name: "id_tipo_negociacion", label: "Tipo de Negociación", type: "select", endpoint: "/endoso/tipos/negociacion", valueField: "id_tipo_negociacion", displayField: "nombre", required: true},
      {name: "id_ciudad", label: "Ciudad", type: "select", endpoint: "/ciudades", valueField: "id_ciudad", displayField: "nombre_ciudad", required: false},
      {name: "id_tipo_valor", label: "Tipo de Valor", type: "select", endpoint: "/tipos/valor", valueField: "id_tipo_valor", displayField: "nombre", required: false},
      {name: "comentarios", label: "Comentarios", type: "textarea", required: false}
    ]
  },
  personas: {
    columns: [
      {title: "#", field: "id_persona", width: "80px"},
      {title: "Nombre", field: "nombre", width: "200px"},
      {title: "Apellidos", field: "apellidos", width: "200px"},
      {title: "País", field: "pais", width: "150px"},
      {title: "Acciones", field: "_actions", width: "120px"}
    ],
    endpoint: "/personas",
    formFields: [
      {name: "nombre", label: "Nombre", type: "text", required: true},
      {name: "apellidos", label: "Apellidos", type: "text"},
      {name: "pais", label: "País", type: "text"},
      {name: "fecha_nacimiento", label: "Fecha de Nacimiento", type: "date"},
      {name: "fecha_muerte", label: "Fecha de Muerte", type: "date"}
    ]
  },
  ciudades: {
    columns: [
      {title: "#", field: "id_ciudad", width: "80px"},
      {title: "Nombre", field: "nombre_ciudad", width: "200px"},
      {title: "País", field: "pais", width: "150px"},
      {title: "Acciones", field: "_actions", width: "120px"}
    ],
    endpoint: "/ciudades",
    formFields: [
      {name: "nombre_ciudad", label: "Nombre", type: "text", required: true},
      {name: "pais", label: "País", type: "text", required: false}
    ]
  },
  monedas: {
    columns: [
      {title: "#", field: "id_moneda", width: "80px"},
      {title: "Nombre", field: "nombre_moneda", width: "200px"},
      {title: "Símbolo", field: "simbolo", width: "100px"},
      {title: "Acciones", field: "_actions", width: "120px"}
    ],
    endpoint: "/monedas",
    formFields: [
      {name: "nombre_moneda", label: "Nombre", type: "text", required: true}
    ]
  },
  tiposProtesto: {
    columns: [
      {title: "#", field: "id_tipo_protesto", width: "80px"},
      {title: "Nombre", field: "nombre", width: "200px"},
      {title: "Acciones", field: "_actions", width: "120px"}
    ],
    endpoint: "/protesto/tipos/protestos",
    formFields: [
      {name: "nombre", label: "Nombre", type: "text", required: true}
    ]
  },
  tiposLetra: {
    columns: [
      {title: "#", field: "id_tipo_letra", width: "80px"},
      {title: "Nombre", field: "nombre", width: "200px"},
      {title: "Descripción", field: "descripcion", width: "300px"},
      {title: "Acciones", field: "_actions", width: "120px"}
    ],
    endpoint: "/letra/tipos/letra",
    formFields: [
      {name: "nombre", label: "Nombre", type: "text", required: true},
      {name: "descripcion", label: "Descripción", type: "textarea"}
    ]
  },
  roles: {
    columns: [
      {title: "#", field: "id_rol", width: "80px"},
      {title: "Nombre", field: "nombre_rol", width: "200px"},
      {title: "Tipo", field: "tipo", width: "150px"},
      {title: "Acciones", field: "_actions", width: "120px"}
    ],
    endpoint: "/roles",
    formFields: [
      {name: "nombre_rol", label: "Nombre", type: "text"},
      {name: "tipo", label: "Tipo", type: "select",
        options: [
          {value: "protesto", label: "Protesto"},
          {value: "letracambio", label: "Letra de Cambio"},
          {value: "endoso", label: "Endoso"}
        ]
      }
    ]
  },
  relacionProtestosLetras: {
    columns: [
      {title: "#", field: "id_relacion", width: "80px"},
      {title: "Protesto", field: "id_protesto", width: "100px"},
      {title: "Detalles Protesto", field: "protesto_detalles", width: "250px"},
      {title: "Letra", field: "id_letra", width: "100px"},
      {title: "Detalles Letra", field: "letra_detalles", width: "250px"},
      {title: "Acciones", field: "_actions", width: "120px"}
    ],
    endpoint: "/protesto/relaciones/letras",
    formFields: [
      {name: "id_protesto", label: "Protesto", type: "select", endpoint: "/protesto", valueField: "id_protesto", displayField: "id_protesto"},
      {name: "id_letra", label: "Letra", type: "select", endpoint: "/letra", valueField: "id_letra", displayField: "id_letra"}
    ]
  },
  relacionLetrasEndosos: {
    columns: [
      {title: "#", field: "id_relacion", width: "80px"},
      {title: "Letra", field: "id_letra", width: "100px"},
      {title: "Detalles Letra", field: "letra_detalles", width: "250px"},
      {title: "Endoso", field: "id_endoso", width: "100px"},
      {title: "Detalles Endoso", field: "endoso_detalles", width: "250px"},
      {title: "Acciones", field: "_actions", width: "120px"}
    ],
    endpoint: "/letra/relaciones/endosos",
    formFields: [
      {name: "id_letra", label: "Letra", type: "select", endpoint: "/letra", valueField: "id_letra", displayField: "id_letra"},
      {name: "id_endoso", label: "Endoso", type: "select", endpoint: "/endoso", valueField: "id_endoso", displayField: "id_endoso"}
    ]
  }
};

const entityNames = {
  protestos: "Protesto",
  letras: "Letra",
  endosos: "Endoso",
  personas: "Persona",
  ciudades: "Ciudad",
  monedas: "Moneda",
  tiposProtesto: "Tipo de Protesto",
  tiposLetra: "Tipo de Letra",
  roles: "Rol",
  relacionProtestosLetras: "Relación Protesto-Letra",
  relacionLetrasEndosos: "Relación Letra-Endoso"
};

// Export
window.AnalisisConfig = AnalisisConfig;
window.CrudConfig = CrudConfig;
window.entityNames = entityNames;

window.entityConfig = CrudConfig;