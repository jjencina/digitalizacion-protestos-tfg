class TablaAnalisis {
  constructor({ itemsPerPage = 20, selectors = {}, formatters = {} } = {}) {
    this.itemsPerPage = itemsPerPage;
    this.currentPage = 1;
    this.totalPages = 1;
    this.data = [];
    this.filtered = [];
    this.config = null;
    this.selectors = Object.assign({
      header: '#tableHeader',
      body: '#tableBody',
      pagination: '#pagination',
      title: '#tableTitle',
      search: '#tableSearch'
    }, selectors);
    this.formatters = {
      date: formatters.date || (v => this.defaultDate(v)),
      number: formatters.number || (v => this.defaultNumber(v))
    };
    this.bindPagination();
    this.bindSearch();
  }

  setConfig(config) { this.config = config; }
  setData(data) { this.data = Array.isArray(data) ? data : []; this.filtered = this.data; this.currentPage = 1; this.render(); }
  applySearch(term) {
    term = (term || '').toLowerCase();
    this.filtered = term
      ? this.data.filter(item => this.config.tableFields.some(f => (item[f.field] ?? '').toString().toLowerCase().includes(term)))
      : this.data;
    this.currentPage = 1;
    this.render();
  }

  render() {
    const cfg = this.config; if (!cfg) return;
    $(this.selectors.header).html(`<tr>${cfg.tableFields.map(f => `<th>${f.title}</th>`).join('')}</tr>`);
    this.totalPages = Math.max(1, Math.ceil(this.filtered.length / this.itemsPerPage));
    if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;

    const start = (this.currentPage - 1) * this.itemsPerPage;
    const pageData = this.filtered.slice(start, start + this.itemsPerPage);

    if (pageData.length === 0) {
      $(this.selectors.body).html(`<tr><td colspan="${cfg.tableFields.length}" class="text-center py-3">Sin datos</td></tr>`);
    } else {
      const rows = pageData.map(item => `
        <tr>
          ${cfg.tableFields.map(field => {
            let v = item[field.field];
            if (field.format === 'date' && v) v = this.formatters.date(v);
            else if (field.format === 'number' && v != null) v = this.formatters.number(v);
            return `<td>${(v ?? '') === '' ? '-' : v}</td>`;
          }).join('')}
        </tr>
      `).join('');
      $(this.selectors.body).html(rows);
    }

    $(this.selectors.title).text(`${cfg.title} (${this.filtered.length})`);
    this.renderPagination();
  }

  renderPagination() {
    const cur = this.currentPage, total = this.totalPages;
    let html = `
      <li class="page-item ${cur === 1 ? 'disabled' : ''}">
        <a class="page-link" href="#" data-page="prev" aria-label="Anterior"><span aria-hidden="true">&laquo;</span></a>
      </li>`;
    let start = Math.max(1, cur - 2);
    let end = Math.min(total, start + 4);
    if (end - start < 4 && start > 1) start = Math.max(1, end - 4);
    for (let i = start; i <= end; i++) {
      html += `<li class="page-item ${i === cur ? 'active' : ''}"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`;
    }
    html += `
      <li class="page-item ${cur === total || total === 0 ? 'disabled' : ''}">
        <a class="page-link" href="#" data-page="next" aria-label="Siguiente"><span aria-hidden="true">&raquo;</span></a>
      </li>`;
    $(this.selectors.pagination).html(html);
  }

  bindPagination() {
    $(document).off('click.tabla', '#pagination .page-link').on('click.tabla', '#pagination .page-link', e => {
      e.preventDefault();
      const a = $(e.currentTarget);
      if (a.parent().hasClass('disabled')) return;
      const p = a.data('page');
      if (p === 'prev') this.currentPage = Math.max(1, this.currentPage - 1);
      else if (p === 'next') this.currentPage = Math.min(this.totalPages, this.currentPage + 1);
      else this.currentPage = parseInt(p);
      this.render();
    });
  }

  bindSearch() {
    $(document).off('input.tabla', this.selectors.search).on('input.tabla', this.selectors.search, e => {
      this.applySearch($(e.currentTarget).val());
    });
  }

  defaultDate(v) {
    try { const d = new Date(v); return isNaN(d) ? v : d.toLocaleDateString('es-ES'); } catch { return v; }
  }
  defaultNumber(v) {
    try { return new Intl.NumberFormat('es-ES').format(Number(v)); } catch { return v; }
  }
}