// ========== CHANNELS VIEW ==========

const ChannelsView = {
  render(channels) {
    const tbody = document.getElementById("channels-tbody");
    if (!tbody) return;

    if (channels.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:var(--text-muted);padding:24px;">Nenhum canal cadastrado</td></tr>`;
      return;
    }

    tbody.innerHTML = channels
      .map(
        (ch) => `
      <tr>
        <td><strong>${sanitize(ch.username)}</strong></td>
        <td><span class="badge ${ch.is_active ? "badge-success" : "badge-danger"}">${ch.is_active ? "Ativo" : "Inativo"}</span></td>
        <td>${new Date(ch.created_at).toLocaleDateString("pt-BR")}</td>
        <td>
          <button class="btn btn-outline" onclick="ChannelsVM.toggle(${ch.id})" title="Toggle">
            <i class="ph ph-toggle-right"></i>
          </button>
          <button class="btn btn-danger" onclick="ChannelsVM.remove(${ch.id})" title="Remover">
            <i class="ph ph-trash"></i>
          </button>
        </td>
      </tr>`
      )
      .join("");

    // Atualizar stat no dashboard
    const dashStat = document.getElementById("dashboard-channels");
    if (dashStat) dashStat.textContent = channels.filter((c) => c.is_active).length;
  },
};
