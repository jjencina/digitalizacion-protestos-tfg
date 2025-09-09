class ExportacionAnalisis {
  constructor() {
    this.entityConfig = {};
    this.currentData = [];
    this.currentEntityType = '';

    this.mappers = {
      // Al exportar "todos" se detecta el tipo_entidad por registro
      todos: (item, acc) => {
        const tipo = (item?.tipo_entidad || '').toLowerCase();
        if (tipo === 'protesto') this.mapProtesto(item, acc);
        if (tipo === 'letra') this.mapLetra(item, acc);
        if (tipo === 'endoso') this.mapEndoso(item, acc);
      },
      protestos: (item, acc) => this.mapProtesto(item, acc),
      letras: (item, acc) => this.mapLetra(item, acc),
      endosos: (item, acc) => this.mapEndoso(item, acc),
    };
  }

  // Configurar el módulo con los datos iniciales
  initExportacion(entityConfig, data, entityType) {
    this.entityConfig = entityConfig;
    this.currentData = data;
    this.currentEntityType = entityType;
  }

  // Actualizar datos cuando se aplican filtros
  updateData(filteredData, entityType) {
    this.currentData = filteredData;
    this.currentEntityType = entityType;
  }

  // ========== MAPEADORES  ==========
  
  mapProtesto(p, acc) {
    // Tabla base "protesto"
    const protestoRow = {
      id_protesto: p.id_protesto,
      fecha_protesto: p.fecha_protesto,
      importe: this.numOrNull(p.importe),
      moneda_nombre: p.moneda_nombre,
      ciudad_nombre: p.ciudad_nombre,
      tipo_protesto_nombre: p.tipo_protesto_nombre,
      tipo_letra_protesto_nombre: p.tipo_letra_protesto_nombre,
      motivo: p.motivo
    };
    this.addRow(acc, 'protesto', protestoRow);

    // Roles protesto
    if (Array.isArray(p.roles)) {
      p.roles.forEach(r => {
        // Exportar persona
        if (r?.persona) { this.addRow(acc, 'persona', this.pick(r.persona, ['id_persona','nombre','apellidos','profesion'])); }
        //Exportar datos rol
        const rolRow = {
          id_protesto: p.id_protesto,
          id_persona: r?.persona?.id_persona ?? r?.id_persona,
          rol_nombre: r?.rol_nombre || r?.nombre_rol || r?.rol,
          ciudad_nombre: r?.ciudad_nombre || r?.ciudad || r?.ciudad_residencia
        };
        this.addRow(acc, 'rol_protesto', rolRow);
      });
    }

    // Mapera letras del protesto
    if (Array.isArray(p.letras)) {
      p.letras.forEach(l => {
        this.mapLetra({ ...l, id_protesto: p.id_protesto }, acc);
      });
    }
  }

  mapLetra(l, acc) {
    const letraRow = {
      id_letra: l.id_letra,
      fecha_letra: l.fecha_letra,
      fecha_vencimiento: l.fecha_vencimiento,
      importe: this.numOrNull(l.importe),
      moneda_nombre: l.moneda_nombre,
      ciudad_nombre: l.ciudad_nombre,
      tipo_letra_nombre: l.tipo_letra_nombre,
      tipo_valor_nombre: l.tipo_valor_nombre
    };
    this.addRow(acc, 'letra_cambio', letraRow);

    // Si la letra proviene de un protesto, opcionalmente relación
    if (l.id_protesto) {
      this.addRow(acc, 'protesto_letra', {
        id_protesto: l.id_protesto,
        id_letra: l.id_letra
      });
    }

    // Roles de la letra
    const rolesLetra = l.roles || l.roles_letra;
    if (Array.isArray(rolesLetra)) {
      rolesLetra.forEach(r => {
        if (r?.persona) {
          this.addRow(acc, 'persona', this.pick(r.persona, ['id_persona','nombre','apellidos','profesion']));
        }
        const rolRow = {
          id_letra: l.id_letra,
          id_persona: r?.persona?.id_persona ?? r?.id_persona,
          rol_nombre: r?.rol_nombre || r?.nombre_rol || r?.rol,
          ciudad_nombre: r?.ciudad_nombre || r?.ciudad || r?.ciudad_residencia
        };
        this.addRow(acc, 'rol_letra', rolRow);
      });
    }

    // Endosos de la letra
    const endosos = l.endosos || l.letra_endosos;
    if (Array.isArray(endosos)) {
      endosos.forEach(e => {
        // Forzar relación con letra
        this.mapEndoso({ ...e, id_letra: l.id_letra }, acc);
        this.addRow(acc, 'letra_endoso', {
          id_letra: l.id_letra,
          id_endoso: e.id_endoso
        });
      });
    }
  }

  mapEndoso(e, acc) {
    const endosoRow = {
      id_endoso: e.id_endoso,
      fecha_endoso: e.fecha_endoso,
      valor: this.numOrNull(e.valor ?? e.importe),
      moneda_nombre: e.moneda_nombre,
      ciudad_nombre: e.ciudad_nombre,
      tipo_negociacion_nombre: e.tipo_negociacion_nombre
    };
    this.addRow(acc, 'endoso', endosoRow);

    // Rol(es) del endoso
    if (Array.isArray(e.roles)) {
      e.roles.forEach(r => {
        if (r?.persona) {
          this.addRow(acc, 'persona', this.pick(r.persona, ['id_persona','nombre','apellidos','profesion']));
        }
        const rolRow = {
          id_endoso: e.id_endoso,
          id_persona: r?.persona?.id_persona ?? r?.id_persona,
          rol_nombre: r?.rol_nombre || r?.nombre_rol || r?.rol,
          ciudad_nombre: r?.ciudad_nombre || r?.ciudad || r?.ciudad_residencia
        };
        this.addRow(acc, 'rol_endoso', rolRow);
      });
    }

    // Si venía pegado a una letra, ya se añadió la fila en letra_endoso
    if (e.id_letra) {
      this.addRow(acc, 'letra_endoso', {
        id_letra: e.id_letra,
        id_endoso: e.id_endoso
      });
    }
  }

  // ========== EXPORTACIÓN PROFUNDA ==========
  exportToSQL() {
    if (!this.currentData || this.currentData.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    const entityType = this.currentEntityType || 'todos';
    const acc = this.newAccumulator();

    // Recorre el subconjunto filtrado y agrega filas por tabla
    this.currentData.forEach(item => {
      const mapper = this.mappers[entityType] || this.mappers['todos'];
      if (mapper) mapper(item, acc);
    });

    // Generar SQL (orden básico por dependencias)
    const order = [
      'persona',
      'protesto',
      'letra_cambio',
      'endoso',
      'protesto_letra',
      'letra_endoso',
      'rol_protesto',
      'rol_letra',
      'rol_endoso'
    ];
    const tables = order.filter(t => acc.tables[t]?.rows.length);

    if (tables.length === 0) {
      alert('No hay filas relacionadas para exportar');
      return;
    }

    const sqlParts = [];
    sqlParts.push('-- Export generado por Panel de Análisis');
    sqlParts.push('SET FOREIGN_KEY_CHECKS=0;');

    tables.forEach(table => {
      const rows = acc.tables[table].rows;
      const columns = this.columnsUnion(rows);
      rows.forEach(row => {
        const values = columns.map(c => this.toSQLValue(row[c]));
        sqlParts.push(`INSERT INTO ${table} (${columns.join(', ')}) VALUES (${values.join(', ')});`);
      });
      sqlParts.push('');
    });

    sqlParts.push('SET FOREIGN_KEY_CHECKS=1;');

    const sqlContent = sqlParts.join('\n');
    this.downloadFile(sqlContent, `analisis_export_${this.getTimestamp()}.sql`, 'text/sql');
    this.showSuccessMessage(`Exportadas ${tables.reduce((s,t)=>s+acc.tables[t].rows.length,0)} filas en ${tables.length} tablas`);
  }

  // ========== HELPERS ==========
  newAccumulator() {
    return {
      tables: {},
      // dedupe por tabla usando JSON de la fila (simple y efectivo)
      push(table, row) {
        if (!row) return;
        if (!this.tables[table]) this.tables[table] = { rows: [], seen: new Set() };
        const key = JSON.stringify(row);
        if (this.tables[table].seen.has(key)) return;
        this.tables[table].seen.add(key);
        this.tables[table].rows.push(row);
      }
    };
  }

  addRow(acc, table, row) {
    acc.push(table, row);
  }

  pick(obj, fields) {
    if (!obj) return null;
    const out = {};
    fields.forEach(f => {
      if (obj[f] !== undefined) out[f] = obj[f];
    });
    return out;
  }

  numOrNull(v) {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : null;
    }

  columnsUnion(rows) {
    const set = new Set();
    rows.forEach(r => Object.keys(r || {}).forEach(k => set.add(k)));
    return Array.from(set);
  }

  toSQLValue(v) {
    if (v === null || v === undefined) return 'NULL';
    if (typeof v === 'number') return Number.isFinite(v) ? String(v) : 'NULL';
    // fecha ISO o AAAA-MM-DD
    if (this.looksLikeDate(v)) return `'${this.escapeSQL(String(v))}'`;
    return `'${this.escapeSQL(String(v))}'`;
  }

  looksLikeDate(s) {
    // Varificas si el formato es YYYY-MM-DD o YYYY-MM-DDTHH:mm:ss
    return /^\d{4}-\d{2}-\d{2}(?:[T ]\d{2}:\d{2}:\d{2})?/.test(String(s));
  }

  escapeSQL(s) {
    return s.replace(/'/g, "''");
  }

  // Descargar archivo
  downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    this.downloadBlob(blob, filename);
  }

  downloadBlob(blob, filename) {
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }

  getTimestamp() {
    const now = new Date();
    return now.toISOString().slice(0, 19).replace(/:/g, '-').replace('T', '_');
  }

  showSuccessMessage(message) {
    const toastHTML = `
      <div class="toast align-items-center text-white bg-success border-0" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
          <div class="toast-body">
            <i class="bi bi-check-circle-fill me-2"></i>${message}
          </div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
      </div>
    `;
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
      document.body.appendChild(toastContainer);
    }
    toastContainer.insertAdjacentHTML('beforeend', toastHTML);
    const toastElement = toastContainer.lastElementChild;
    if (typeof bootstrap !== 'undefined' && bootstrap.Toast) {
      const toast = new bootstrap.Toast(toastElement, { delay: 3000 });
      toast.show();
      toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
      });
    } else {
      toastElement.style.display = 'block';
      setTimeout(() => { toastElement.remove(); }, 3000);
    }
  }
}