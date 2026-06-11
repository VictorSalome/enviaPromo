import re

with open("/home/ubuntu/enviaPromo/public/index.html", "r") as f:
    html = f.read()

# Replace renderFilters to include action buttons and filter creation form
old_render = """async function renderFilters() {
      try {
        const res = await fetch('/api/filters', { credentials: 'include' });
        const data = await res.json();
        if (data.success) {
          document.getElementById('stat-filters').textContent = data.data.length;
          
          const container = document.getElementById('filters-container');
          if (data.data.length === 0) {
            container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 40px;"><i class="ph ph-info"></i> Nenhuma categoria cadastrada</p>';
            return;
          }
          
          container.innerHTML = data.data.map(cat => `
            <div class="card mb-4">
              <div class="card-header" style="border-left: 4px solid ${cat.color || '#00f0ff'};">
                <div class="card-title">
                  <i class="ph ph-folder" style="color: ${cat.color || '#00f0ff'};"></i>
                  ${cat.name}
                </div>
                <span class="badge badge-success">${cat.filters ? cat.filters.length : 0} filtros</span>
              </div>
              <div class="card-body">
                ${cat.filters && cat.filters.length > 0 ? `
                  <div class="table-container">
                    <table class="data-table">
                      <thead>
                        <tr>
                          <th>Nome</th>
                          <th>Tipo</th>
                          <th>Keywords</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${cat.filters.map(f => `
                          <tr>
                            <td>${f.name}</td>
                            <td>
                              <span class="badge ${f.type === 'broad' ? 'badge-warning' : 'badge-success'}">
                                ${f.type === 'broad' ? 'Amplo' : 'Específico'}
                              </span>
                            </td>
                            <td>${f.keywords}</td>
                            <td>
                              <span class="badge ${f.is_active ? 'badge-success' : 'badge-error'}">
                                <i class="ph ${f.is_active ? 'ph-check' : 'ph-x'}"></i>
                              </span>
                            </td>
                          </tr>
                        `).join('')}
                      </tbody>
                    </table>
                  </div>
                ` : '<p style="color: var(--text-muted); font-size: 14px;"><i class="ph ph-info"></i> Nenhum filtro nesta categoria</p>'}
              </div>
            </div>
          `).join('');
        }
      } catch (err) {
        console.error('Erro ao renderizar filtros');
      }
    }"""

new_render = """async function renderFilters() {
      try {
        const res = await fetch('/api/filters', { credentials: 'include' });
        const data = await res.json();
        if (data.success) {
          document.getElementById('stat-filters').textContent = data.data.length;
          
          const container = document.getElementById('filters-container');
          if (data.data.length === 0) {
            container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 40px;"><i class="ph ph-info"></i> Nenhuma categoria cadastrada</p>';
            return;
          }
          
          container.innerHTML = data.data.map(cat => {
            const catColor = cat.color || '#00f0ff';
            return '<div class="card mb-4">' +
              '<div class="card-header" style="border-left: 4px solid ' + catColor + ';">' +
                '<div class="card-title">' +
                  '<i class="ph ph-folder" style="color: ' + catColor + ';"></i>' + cat.name +
                '</div>' +
                '<div class="flex gap-2" style="align-items: center;">' +
                  '<span class="badge badge-success">' + (cat.filters ? cat.filters.length : 0) + ' filtros</span>' +
                  '<button onclick="editCategory(' + cat.id + ')" class="btn btn-sm btn-outline" style="padding: 4px 8px;" title="Editar">' +
                    '<i class="ph ph-pencil"></i>' +
                  '</button>' +
                  '<button onclick="deleteCategory(' + cat.id + ')" class="btn btn-sm btn-outline" style="padding: 4px 8px;" title="Remover">' +
                    '<i class="ph ph-trash"></i>' +
                  '</button>' +
                '</div>' +
              '</div>' +
              '<div class="card-body">' +
                '<div class="flex gap-2 mb-4" style="flex-wrap: wrap;">' +
                  '<input type="text" id="filter-name-' + cat.id + '" class="form-input" placeholder="Nome do filtro" style="flex: 1; min-width: 120px;">' +
                  '<select id="filter-type-' + cat.id + '" class="form-input" style="width: auto; min-width: 100px;">' +
                    '<option value="broad">Amplo</option>' +
                    '<option value="specific">Especifico</option>' +
                  '</select>' +
                  '<input type="text" id="filter-keywords-' + cat.id + '" class="form-input" placeholder="Keywords" style="flex: 2; min-width: 150px;">' +
                  '<button onclick="addFilterToCategory(' + cat.id + ')" class="btn btn-primary btn-sm" style="padding: 8px 12px;">' +
                    '<i class="ph ph-plus"></i>' +
                  '</button>' +
                '</div>' +
                (cat.filters && cat.filters.length > 0 ?
                  '<div class="table-container">' +
                    '<table class="data-table">' +
                      '<thead><tr><th>Nome</th><th>Tipo</th><th>Keywords</th><th>Status</th><th>Acoes</th></tr></thead>' +
                      '<tbody>' + cat.filters.map(f =>
                        '<tr>' +
                          '<td>' + f.name + '</td>' +
                          '<td><span class="badge ' + (f.type === 'broad' ? 'badge-warning' : 'badge-success') + '">' + (f.type === 'broad' ? 'Amplo' : 'Especifico') + '</span></td>' +
                          '<td>' + f.keywords + '</td>' +
                          '<td><span class="badge ' + (f.is_active ? 'badge-success' : 'badge-error') + '"><i class="ph ' + (f.is_active ? 'ph-check' : 'ph-x') + '"></i></span></td>' +
                          '<td>' +
                            '<button onclick="editFilter(' + f.id + ')" class="btn btn-sm btn-outline" style="padding: 4px 8px; margin-right: 4px; font-size: 12px;" title="Editar"><i class="ph ph-pencil"></i></button>' +
                            '<button onclick="deleteFilter(' + f.id + ')" class="btn btn-sm btn-outline" style="padding: 4px 8px; font-size: 12px;" title="Remover"><i class="ph ph-trash"></i></button>' +
                          '</td>' +
                        '</tr>'
                      ).join('') + '</tbody>' +
                    '</table>' +
                  '</div>'
                : '<p style="color: var(--text-muted); font-size: 14px;"><i class="ph ph-info"></i> Nenhum filtro nesta categoria</p>') +
              '</div>' +
            '</div>';
          }).join('');
        }
      } catch (err) {
        console.error('Erro ao renderizar filtros');
      }
    }"""

html = html.replace(old_render, new_render)

# Replace loadPriceAlerts to include edit button
old_load = """async function loadPriceAlerts() {
      try {
        const res = await fetch('/api/price-alerts', { credentials: 'include' });
        const data = await res.json();
        if (data.success) {
          const tbody = document.getElementById('price-alerts-list');
          if (data.data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: var(--text-muted);"><i class="ph ph-info"></i> Nenhum alerta cadastrado</td></tr>';
            return;
          }
          tbody.innerHTML = data.data.map(alert => `
            <tr>
              <td>${alert.product_name || alert.product || '-'}</td>
              <td>R$ ${alert.target_price}</td>
              <td>
                <button onclick="deletePriceAlert(${alert.id})" class="btn btn-sm btn-outline" style="padding: 4px 8px; font-size: 12px;">
                  <i class="ph ph-trash"></i>
                </button>
              </td>
            </tr>
          `).join('');
        }
      } catch (err) {
        console.error('Erro ao carregar alertas');
      }
    }"""

new_load = """async function loadPriceAlerts() {
      try {
        const res = await fetch('/api/price-alerts', { credentials: 'include' });
        const data = await res.json();
        if (data.success) {
          const tbody = document.getElementById('price-alerts-list');
          if (data.data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: var(--text-muted);"><i class="ph ph-info"></i> Nenhum alerta cadastrado</td></tr>';
            return;
          }
          tbody.innerHTML = data.data.map(alert =>
            '<tr>' +
              '<td>' + (alert.product_name || alert.product || '-') + '</td>' +
              '<td>R$ ' + alert.target_price + '</td>' +
              '<td>' +
                '<button onclick="editPriceAlert(' + alert.id + ')" class="btn btn-sm btn-outline" style="padding: 4px 8px; margin-right: 4px; font-size: 12px;" title="Editar"><i class="ph ph-pencil"></i></button>' +
                '<button onclick="deletePriceAlert(' + alert.id + ')" class="btn btn-sm btn-outline" style="padding: 4px 8px; font-size: 12px;" title="Remover"><i class="ph ph-trash"></i></button>' +
              '</td>' +
            '</tr>'
          ).join('');
        }
      } catch (err) {
        console.error('Erro ao carregar alertas');
      }
    }"""

html = html.replace(old_load, new_load)

with open("/home/ubuntu/enviaPromo/public/index.html", "w") as f:
    f.write(html)

print("Render e Load atualizados")
