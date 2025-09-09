class GestorBusquedas {
    static iniciarTodas() {
        this.iniciarPersonas();
        this.iniciarCiudades();
        this.iniciarMonedas();
        this.iniciarTiposLetra();
        this.iniciarTiposProtesto();
        this.iniciarTiposValor();
    }

    // Métodos iniciar
    static initPersonaSearches() { this.iniciarPersonas(); }
    static initCiudadSearches() { this.iniciarCiudades(); }
    static initMonedaSearches() { this.iniciarMonedas(); }
    static initTipoLetraSearches() { this.iniciarTiposLetra(); }
    static initTipoProtestoSearches() { this.iniciarTiposProtesto(); }
    static initTipoValorSearches() { this.iniciarTiposValor(); }

    static iniciarPersonas() { BuscadorEntidades.inicializarBuscadorEntidad(SearchConfigs.persona); }
    static iniciarCiudades() { BuscadorEntidades.inicializarBuscadorEntidad(SearchConfigs.ciudad); }
    static iniciarMonedas() { BuscadorEntidades.inicializarBuscadorEntidad(SearchConfigs.moneda); }
    static iniciarTiposLetra() { BuscadorEntidades.inicializarBuscadorEntidad(SearchConfigs.tipoLetra); }
    static iniciarTiposProtesto() { BuscadorEntidades.inicializarBuscadorEntidad(SearchConfigs.tipoProtesto); }
    static iniciarTiposValor() { BuscadorEntidades.inicializarBuscadorEntidad(SearchConfigs.tipoValor); }

    // Selección manual (para contextos/modales si aplica)
    static seleccionarPersona(id, nombre, contexto = null) {
        if (contexto) {
            this._manejarSeleccionContextual('persona', id, nombre, contexto);
        } else {
            const activeInput = $('.persona-search:focus');
            if (activeInput.length) {
                BuscadorEntidades.seleccionarEntidad(id, nombre, {
                    targetInput: activeInput,
                    hiddenInput: activeInput.siblings('input[type="hidden"]'),
                    entityName: 'persona'
                });
            }
        }
    }

    static seleccionarCiudad(id, nombre, contexto = null) {
        if (contexto) {
            this._manejarSeleccionContextual('ciudad', id, nombre, contexto);
        } else {
            const activeInput = $('.ciudad-search:focus');
            if (activeInput.length) {
                BuscadorEntidades.seleccionarEntidad(id, nombre, {
                    targetInput: activeInput,
                    hiddenInput: activeInput.siblings('input[type="hidden"]'),
                    entityName: 'ciudad'
                });
            }
        }
    }

    static seleccionarMoneda(id, nombre, contexto = null) {
        if (contexto) {
            this._manejarSeleccionContextual('moneda', id, nombre, contexto);
        } else {
            const activeInput = $('.moneda-search:focus');
            if (activeInput.length) {
                BuscadorEntidades.seleccionarEntidad(id, nombre, {
                    targetInput: activeInput,
                    hiddenInput: activeInput.siblings('input[type="hidden"]'),
                    entityName: 'moneda'
                });
            }
        }
    }

    static seleccionarTipoLetra(id, nombre, contexto = null) {
        if (contexto) {
            this._manejarSeleccionContextual('tipoLetra', id, nombre, contexto);
        } else {
            const activeInput = $('.tipo-letra-search:focus');
            if (activeInput.length) {
                BuscadorEntidades.seleccionarEntidad(id, nombre, {
                    targetInput: activeInput,
                    hiddenInput: activeInput.siblings('input[type="hidden"]'),
                    entityName: 'tipo'
                });
            }
        }
    }

    static seleccionarTipoProtesto(id, nombre, contexto = null) {
        if (contexto) {
            this._manejarSeleccionContextual('tipoProtesto', id, nombre, contexto);
        } else {
            const activeInput = $('.tipo-protesto-search:focus');
            if (activeInput.length) {
                BuscadorEntidades.seleccionarEntidad(id, nombre, {
                    targetInput: activeInput,
                    hiddenInput: activeInput.siblings('input[type="hidden"]'),
                    entityName: 'tipo'
                });
            }
        }
    }

    // Internos
    static _manejarSeleccionContextual(tipoEntidad, id, nombre, contexto) {
        // contexto: "letra_0", "endoso_0_1", "protesto_main", o nombres simples (escribano, presentado, etc.)
        const parts = contexto.split('_');
        const tipo = parts[0];
        const letraIndex = parts[1];
        const endosoIndex = parts[2];

        switch (tipoEntidad) {
            case 'persona':
                this._seleccionarPersonaPorContexto(id, nombre, tipo, letraIndex, endosoIndex);
                break;
            case 'ciudad':
                this._seleccionarCiudadPorContexto(id, nombre, tipo, letraIndex, endosoIndex);
                break;
            case 'moneda':
                this._seleccionarMonedaPorContexto(id, nombre, tipo, letraIndex, endosoIndex);
                break;
            case 'tipoLetra':
                this._seleccionarTipoLetraPorContexto(id, nombre, tipo, letraIndex);
                break;
            case 'tipoProtesto':
                this._seleccionarTipoProtestoPorContexto(id, nombre, tipo);
                break;
        }
    }

    static _seleccionarPersonaPorContexto(id, nombre, tipo, letraIndex, endosoIndex) {
        const simples = {
            'escribano': 'escribano_id',
            'protestante': 'protestante_persona_id',
            'presentado': 'presentado_persona_id',
            'abona': 'abona_persona_id',
            'cedido': 'cedido_persona_id',
            'representante': 'representante_persona_id'
        };

        if (simples[tipo]) {
            $(`input[name="${simples[tipo]}"]`).val(id);
            $(`.persona-input[data-for="${tipo}"], .persona-search[data-for="${tipo}"]`).val(nombre);
        } else if (['librador', 'librado', 'aceptante', 'domiciliado', 'indicado'].includes(tipo) && letraIndex !== undefined) {
            $(`input[name="letras[${letraIndex}][${tipo}_persona_id]"]`).val(id);
            $(`.persona-input[data-for="${tipo}_${letraIndex}"], .persona-search[data-for="${tipo}_${letraIndex}"]`).val(nombre);
        } else if (['endosante', 'endosado'].includes(tipo) && letraIndex !== undefined && endosoIndex !== undefined) {
            $(`input[name="letras[${letraIndex}][endosos][${endosoIndex}][${tipo}_persona_id]"]`).val(id);
            $(`.persona-input[data-for="${tipo}_${letraIndex}_${endosoIndex}"], .persona-search[data-for="${tipo}_${letraIndex}_${endosoIndex}"]`).val(nombre);
        }
    }

    static _seleccionarCiudadPorContexto(id, nombre, tipo, letraIndex, endosoIndex) {
        if (tipo === 'ciudad' && letraIndex !== undefined) {
            $(`input[name="letras[${letraIndex}][ciudad_id]"]`).val(id);
            $(`.ciudad-input[data-for="ciudad_letra_${letraIndex}"], .ciudad-search[data-for="ciudad_letra_${letraIndex}"]`).val(nombre);
        } else if (['endosante', 'endosado'].includes(tipo) && letraIndex !== undefined && endosoIndex !== undefined) {
            $(`input[name="letras[${letraIndex}][endosos][${endosoIndex}][${tipo}_ciudad_id]"]`).val(id);
            $(`.ciudad-input[data-for="${tipo}_ciudad_${letraIndex}_${endosoIndex}"], .ciudad-search[data-for="${tipo}_ciudad_${letraIndex}_${endosoIndex}"]`).val(nombre);
        } else {
            // Campos principales del protesto
            const hiddenInput = $(`input[name="${tipo}_ciudad_id"]`);
            const displayInput = $(`.ciudad-input[data-for="${tipo}"], .ciudad-search[data-for="${tipo}"]`);
            if (hiddenInput.length && displayInput.length) {
                hiddenInput.val(id);
                displayInput.val(nombre);
            }
        }
    }

    static _seleccionarMonedaPorContexto(id, nombre, tipo, letraIndex, endosoIndex) {
        if (tipo === 'letra' && letraIndex !== undefined) {
            $(`input[name="letras[${letraIndex}][moneda_id]"]`).val(id);
            $(`.moneda-input[data-for="letra_${letraIndex}"], .moneda-search[data-for="letra_${letraIndex}"]`).val(nombre);
        } else if (tipo === 'endoso' && letraIndex !== undefined && endosoIndex !== undefined) {
            $(`input[name="letras[${letraIndex}][endosos][${endosoIndex}][moneda_id]"]`).val(id);
            $(`.moneda-input[data-for="endoso_${letraIndex}_${endosoIndex}"], .moneda-search[data-for="endoso_${letraIndex}_${endosoIndex}"]`).val(nombre);
        } else {
            $(`input[name="moneda_protesto_id"]`).val(id);
            $(`.moneda-input[data-for="protesto"], .moneda-search[data-for="protesto"]`).val(nombre);
        }
    }

    static _seleccionarTipoLetraPorContexto(id, nombre, tipo, letraIndex) {
        if (tipo === 'protesto') {
            $(`input[name="tipo_letra_protesto_id"]`).val(id);
            $(`.tipo-letra-search[data-for="tipo_letra_protesto"]`).val(nombre);
        } else if (letraIndex !== undefined) {
            $(`input[name="letras[${letraIndex}][tipo_letra_id]"]`).val(id);
            $(`.tipo-letra-search[data-for="tipo_letra_${letraIndex}"]`).val(nombre);
        }
    }

    static _seleccionarTipoProtestoPorContexto(id, nombre, tipo) {
        $(`input[name="tipo_protesto_id"]`).val(id);
        $(`.tipo-protesto-search[data-for="tipo_protesto"]`).val(nombre);
    }
}

window.GestorBusquedas = GestorBusquedas;
window.SearchAPI = GestorBusquedas;