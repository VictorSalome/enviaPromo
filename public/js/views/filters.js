// ========== FILTERS VIEW ==========

const FiltersView = {
  render(categories) {
    const container = document.getElementById("filters-container");
    if (!container) return;

    if (categories.length === 0) {
      container.innerHTML = `<p style="color:var(--text-muted);text-align:center;padding:24px;">Nenhuma categoria criada</p>`;
      return;
    }

    container.innerHTML = categories
      .map(
        (cat) => `
      <div class="card" style="margin-bottom:16px;">
        <div class="card-header">
          <div style="display:flex;align-items:center;gap:12px;">
            <span style="font-size:20px;">${sanitize(cat.icon || "📁")}</span>
            <span class="card-title" style="color:${sanitize(cat.color || "var(--neon-cyan)")};">${sanitize(cat.name)}</span>
            <span class="badge badge-info">${(cat.filters || []).length} filtros</span>
          </div>
          <div style="display:flex;gap:8px;">
            <button class="btn btn-outline" onclick="FiltersVM.editCategory(${cat.id})" title="Editar">
              <i class="ph ph-pencil"></i>
            </button>
            <button class="btn btn-danger" onclick="FiltersVM.removeCategory(${cat.id})" title="Remover">
              <i class="ph ph-trash"></i>
            </button>
          </div>
        </div>
        <div class="card-body">
          ${
            (cat.filters || []).length === 0
              ? `<p style="color:var(--text-muted);font-size:13px;">Nenhum filtro nesta categoria</p>`
              : `<table class="data-table">
                <thead><tr><th>Nome</th><th>Tipo</th><th>Keywords</th><th>Ações</th></tr></thead>
                <tbody>${cat.filters
                  .map(
                    (f) => `
                  <tr>
                    <td>${sanitize(f.name)}</td>
                    <td><span class="badge badge-info">${f.type === "specific" ? "Específico" : "Amplo"}</span></td>
                    <td style="max-width:300px;word-break:break-all;font-size:12px;color:var(--text-secondary);">${sanitize(typeof f.keywords === "string" ? f.keywords : JSON.stringify(f.keywords))}</td>
                    <td>
                      <button class="btn btn-outline" onclick="FiltersVM.editFilter(${f.id})" title="Editar">
                        <i class="ph ph-pencil"></i>
                      </button>
                      <button class="btn btn-danger" onclick="FiltersVM.removeFilter(${f.id})" title="Remover">
                        <i class="ph ph-trash"></i>
                      </button>
                    </td>
                  </tr>`
                  )
                  .join("")}
                </tbody>
              </table>`
          }
          <div style="margin-top:12px;">
            <button class="btn btn-outline" onclick="FiltersVM.addFilter(${cat.id})">
              <i class="ph ph-plus"></i> Adicionar Filtro
            </button>
          </div>
        </div>
      </div>`
      )
      .join("");
  },
};
