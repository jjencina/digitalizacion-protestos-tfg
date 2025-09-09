class GrafoRelacionalD3 {
  renderizar(selectorContenedor, datos, config) {
    // Contenedor
    const $contenedor = $(selectorContenedor);
    $contenedor.html('<div id="networkGraph"></div>');
    const el = document.getElementById('networkGraph');

    // Estructura de red nodos y aristas
    const red = this.procesarDatosRed(datos, config);
    if (!red.nodes.length) {
      $contenedor.html('<div class="alert alert-info">No hay suficientes datos para crear una red de relaciones</div>');
      return;
    }

    // Dimensiones
    const width = el.offsetWidth || 800;
    const height = 700;

    // svg y zoom
    const svg = d3.select('#networkGraph')
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .style('background', '#f8f9fa')
      .style('border-radius', '8px');

    // Gradiente para aristas
    const defs = svg.append('defs');
    const grad = defs.append('linearGradient').attr('id', 'linkGradient').attr('gradientUnits', 'userSpaceOnUse');
    grad.append('stop').attr('offset', '0%').attr('stop-color', '#3498db').attr('stop-opacity', 0.8);
    grad.append('stop').attr('offset', '100%').attr('stop-color', '#e74c3c').attr('stop-opacity', 0.3);

    const g = svg.append('g');
    const zoom = d3.zoom().scaleExtent([0.1, 4]).on('zoom', e => g.attr('transform', e.transform));
    svg.call(zoom);

    // "Fuerzas": aristas, repulsión, centro y colisión
    const simulacion = d3.forceSimulation(red.nodes)
      .force('link', d3.forceLink(red.links).id(d => d.id).distance(d => Math.max(50, 150 - d.value * 5)).strength(0.5))
      .force('charge', d3.forceManyBody().strength(-300).distanceMax(400))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(d => d.size + 5).strength(0.7));

    // aristas a mas volumen mas grosor)
    const enlace = g.append('g').attr('class', 'links')
      .selectAll('line').data(red.links).enter().append('line')
      .attr('stroke', 'url(#linkGradient)')
      .attr('stroke-width', d => Math.max(1, Math.sqrt(d.value) * 2))
      .attr('stroke-opacity', 0.6)
      .style('filter', 'drop-shadow(0px 2px 4px rgba(0,0,0,0.1))');

    // Nodos arrastrables
    const nodo = g.append('g').attr('class', 'nodes')
      .selectAll('g').data(red.nodes).enter().append('g').attr('class', 'node')
      .call(d3.drag()
        .on('start', (ev) => { if (!ev.active) simulacion.alphaTarget(0.3).restart(); ev.subject.fx = ev.subject.x; ev.subject.fy = ev.subject.y; })
        .on('drag', (ev) => { ev.subject.fx = ev.x; ev.subject.fy = ev.y; })
        .on('end',  (ev) => { if (!ev.active) simulacion.alphaTarget(0); ev.subject.fx = null; ev.subject.fy = null; })
      );

    // Degradado por nodo
    const gradNodo = defs.selectAll('.nodeGradient').data(red.nodes).enter()
      .append('radialGradient').attr('class', 'nodeGradient').attr('id', d => `nodeGradient-${d.id}`).attr('cx', '30%').attr('cy', '30%');
    gradNodo.append('stop').attr('offset', '0%').attr('stop-color', d => d.color).attr('stop-opacity', 1);
    gradNodo.append('stop').attr('offset', '100%').attr('stop-color', d => d3.color(d.color).darker(2)).attr('stop-opacity', 1);

    // Círculo y etiqueta
    const circulos = nodo.append('circle')
      .attr('r', d => d.size)
      .attr('fill', d => `url(#nodeGradient-${d.id})`)
      .attr('stroke', '#fff')
      .attr('stroke-width', 3)
      .style('filter', 'drop-shadow(0px 4px 8px rgba(0,0,0,0.2))');

    nodo.append('text')
      .text(d => d.name)
      .attr('font-size', d => Math.max(10, d.size / 3))
      .attr('font-family', 'Arial, sans-serif')
      .attr('font-weight', 'bold')
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .attr('fill', '#2c3e50')
      .style('pointer-events', 'none')
      .style('text-shadow', '1px 1px 2px rgba(255,255,255,0.8)');

    // Tooltip
    const tooltip = d3.select('body').append('div')
      .attr('class', 'network-tooltip')
      .style('position', 'absolute')
      .style('background', 'rgba(0,0,0,0.8)')
      .style('color', 'white')
      .style('padding', '10px')
      .style('border-radius', '5px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .style('z-index', 1000);

    function mostrarTooltip(ev, html) {
      tooltip.html(html).style('opacity', 1)
        .style('left', (ev.pageX + 10) + 'px')
        .style('top', (ev.pageY - 10) + 'px');
    }
    function ocultarTooltip() { tooltip.style('opacity', 0); }

    // Hoover aristas con información 
    enlace.on('mouseover', function(ev, d) {
      d3.select(this).attr('stroke-opacity', 1).attr('stroke-width', Math.max(3, Math.sqrt(d.value) * 3));
      mostrarTooltip(ev, `Conexión: ${d.source.name} ↔ ${d.target.name}<br>Fuerza: ${d.value}`);
    }).on('mouseout', function(ev, d) {
      d3.select(this).attr('stroke-opacity', 0.6).attr('stroke-width', Math.max(1, Math.sqrt(d.value) * 2));
      ocultarTooltip();
    });

    // Hover nodos
    circulos.on('mouseover', function(ev, d) {
      d3.select(this).transition().duration(200).attr('r', d.size * 1.2).attr('stroke-width', 5);
      enlace.style('stroke-opacity', l => (l.source === d || l.target === d ? 1 : 0.1));
      mostrarTooltip(ev, `<strong>${d.name}</strong><br>Registros: ${d.count}<br>Conexiones: ${d.connections}`);
    }).on('mouseout', function(ev, d) {
      d3.select(this).transition().duration(200).attr('r', d.size).attr('stroke-width', 3);
      enlace.style('stroke-opacity', 0.6);
      ocultarTooltip();
    });

    // Aplica posiciones
    simulacion.on('tick', () => {
      enlace.attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y);

      nodo.attr('transform', d => `translate(${d.x},${d.y})`);
    });
  }

  procesarDatosRed(datos, config) {
    if (!config?.locationField) return { nodes: [], links: [] };

    const ocurrenciasCiudad = new Map();
    const conexiones = new Map();

    // Normalización de datos
    const normalizar = (n) => (typeof n === 'string') ? n.trim() : '';
    const anyadirCiudad = (set, n) => { const v = normalizar(n); if (v) set.add(v); };
    const anyadirCiudadesRoles = (set, roles) => {
      if (!Array.isArray(roles)) return;
      roles.forEach(r => {
        anyadirCiudad(set, r?.ciudad_nombre || r?.nombre_ciudad || r?.ciudad || r?.ciudad_residencia);
        anyadirCiudad(set, r?.persona?.ciudad_nombre || r?.persona?.ciudad);
      });
    };

    // Recoleccón de datos por entidad
    const recolectarProtesto = (p) => {
      const set = new Set();
      anyadirCiudad(set, p?.ciudad_nombre || p?.nombre_ciudad || p?.ciudad);
      anyadirCiudadesRoles(set, p?.roles);
      if (Array.isArray(p?.letras)) {
        p.letras.forEach(l => {
          anyadirCiudad(set, l?.ciudad_nombre || l?.nombre_ciudad || l?.ciudad);
          anyadirCiudadesRoles(set, l?.roles || l?.roles_letra);
          const endosos = l?.endosos || l?.letra_endosos;
          if (Array.isArray(endosos)) {
            endosos.forEach(e => {
              anyadirCiudad(set, e?.ciudad_nombre || e?.nombre_ciudad || e?.ciudad);
              anyadirCiudadesRoles(set, e?.roles);
            });
          }
        });
      }
      return Array.from(set);
    };

    const recolectarLetra = (l) => {
      const set = new Set();
      anyadirCiudad(set, l?.ciudad_nombre || l?.nombre_ciudad || l?.ciudad);
      anyadirCiudadesRoles(set, l?.roles || l?.roles_letra);
      const endosos = l?.endosos || l?.letra_endosos;
      if (Array.isArray(endosos)) {
        endosos.forEach(e => {
          anyadirCiudad(set, e?.ciudad_nombre || e?.nombre_ciudad || e?.ciudad);
          anyadirCiudadesRoles(set, e?.roles);
        });
      }
      return Array.from(set);
    };

    const recolectarEndoso = (e) => {
      const set = new Set();
      anyadirCiudad(set, e?.ciudad_nombre || e?.nombre_ciudad || e?.ciudad);
      anyadirCiudadesRoles(set, e?.roles);
      return Array.from(set);
    };

    // Agrega conexiones entre todas las ciudades del grupo
    const agregarGrupo = (arrCiudades) => {
      const ciudades = Array.from(new Set((arrCiudades || []).map(c => normalizar(c)).filter(Boolean)));
      if (ciudades.length < 2) {
        if (ciudades.length === 1) ocurrenciasCiudad.set(ciudades[0], (ocurrenciasCiudad.get(ciudades[0]) || 0) + 1);
        return;
      }
      ciudades.forEach(c => ocurrenciasCiudad.set(c, (ocurrenciasCiudad.get(c) || 0) + 1));
      for (let i = 0; i < ciudades.length; i++) {
        for (let j = i + 1; j < ciudades.length; j++) {
          const [a, b] = [ciudades[i], ciudades[j]].sort();
          const key = `${a}||${b}`;
          if (!conexiones.has(key)) conexiones.set(key, { source: a, target: b, value: 0 });
          conexiones.get(key).value += 1;
        }
      }
    };

    // Recorre dataset por tipo
    (datos || []).forEach(item => {
      const tipo = (item?.tipo_entidad || '').toLowerCase();
      if (tipo === 'protesto' || Array.isArray(item?.letras) || item?.tipo_protesto_nombre) agregarGrupo(recolectarProtesto(item));
      if (tipo === 'letra' || item?.tipo_letra_nombre || Array.isArray(item?.endosos) || Array.isArray(item?.letra_endosos)) agregarGrupo(recolectarLetra(item));
      if (tipo === 'endoso' || item?.tipo_negociacion_nombre || Array.isArray(item?.roles)) agregarGrupo(recolectarEndoso(item));
    });

    // Nodos con tamaño y color por frecuencia
    const nodos = Array.from(ocurrenciasCiudad.entries()).map(([name, count]) => ({
      id: name,
      name,
      count,
      size: Math.max(15, Math.min(50, count * 2)),
      color: this.colorNodo(count),
      connections: 0
    }));

    // Enlaces filtrados y contadores de conexiones por nodo
    const enlaces = Array.from(conexiones.values()).filter(l => l.value > 0);
    const mapaNodos = new Map(nodos.map(n => [n.id, n]));
    enlaces.forEach(l => {
      mapaNodos.get(l.source).connections++;
      mapaNodos.get(l.target).connections++;
    });

    return { nodes: nodos, links: enlaces };
  }

  colorNodo(count) {
    if (count > 20) return '#d62728';
    if (count > 10) return '#ff7f0e';
    if (count > 5)  return '#bcbd22';
    if (count > 1)  return '#2ca02c';
    return '#1f77b4';
  }
}

window.GrafoRelacionalD3 = GrafoRelacionalD3;
const grafoRelacionalD3 = new GrafoRelacionalD3();
window.NetworkGraph = { render: grafoRelacionalD3.renderizar.bind(grafoRelacionalD3) };