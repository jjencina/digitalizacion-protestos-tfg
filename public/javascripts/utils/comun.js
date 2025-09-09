class CommonUtils {
  static fechas = {
    // dd/mm/yyyy
    format(date) {
      if (!date) return '';
      const d = new Date(date);
      return isNaN(d.getTime()) ? '' : d.toLocaleDateString('es-ES');
    },
    // yyyy-mm-dd para inputs
    input(dateString) {
      if (!dateString) return '';
      try {
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return '';
        return d.toISOString().split('T')[0];
      } catch { return ''; }
    },
    // normaliza a yyyy-mm-dd para SQL
    normalizeForSQL(value) {
      if (!value) return null;
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
        const [d, m, y] = value.split('/');
        return `${y}-${m}-${d}`;
      }
      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
      const dt = new Date(value);
      if (!isNaN(dt.getTime())) {
        const mm = String(dt.getMonth() + 1).padStart(2, '0');
        const dd = String(dt.getDate()).padStart(2, '0');
        const yyyy = dt.getFullYear();
        return `${yyyy}-${mm}-${dd}`;
      }
      return null;
    }
  };

  static numeros = {
    format(n, locale = 'es-ES') {
      if (n === null || n === undefined || n === '') return '';
      const num = typeof n === 'number' ? n : parseFloat(n);
      if (Number.isNaN(num)) return '';
      return new Intl.NumberFormat(locale).format(num);
    }
  };

  static html = {
    escape(text) {
      if (text === null || text === undefined) return '';
      return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }
  };
}

window.CommonUtils = CommonUtils;