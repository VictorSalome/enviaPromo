// ========== PRICE ALERTS VIEW ==========

const PriceAlertsView = {
  render(alerts) {
    const tbody = document.getElementById("alerts-tbody");
    if (!tbody) return;

    if (alerts.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:var(--text-muted);padding:24px;">Nenhum alerta cadastrado</td></tr>`;
      return;
    }

    tbody.innerHTML = alerts
      .map(
        (a) => `
      <tr>
        <td><strong>${sanitize(a.product_name)}</strong></td>
        <td>${formatBRL(a.target_price)}</td>
        <td>${new Date(a.created_at).toLocaleDateString("pt-BR")}</td>
        <td>
          <button class="btn btn-outline" onclick="PriceAlertsVM.edit(${a.id})" title="Editar">
            <i class="ph ph-pencil"></i>
          </button>
          <button class="btn btn-danger" onclick="PriceAlertsVM.remove(${a.id})" title="Remover">
            <i class="ph ph-trash"></i>
          </button>
        </td>
      </tr>`
      )
      .join("");
  },
};
