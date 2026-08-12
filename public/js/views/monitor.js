// ========== MONITOR VIEW ==========

const MonitorView = {
  updateRunning(running) {
    const btn = document.getElementById("monitor-toggle-btn");
    const badge = document.getElementById("monitor-badge");
    const dot = document.getElementById("monitor-dot");
    const text = document.getElementById("monitor-text");

    if (btn) {
      btn.innerHTML = running
        ? '<i class="ph ph-stop"></i> Parar Monitor'
        : '<i class="ph ph-play"></i> Iniciar Monitor';
      btn.className = running ? "btn btn-danger btn-lg" : "btn btn-success btn-lg";
    }
    if (badge) {
      badge.className = running ? "badge badge-success" : "badge badge-danger";
      badge.textContent = running ? "Rodando" : "Parado";
    }
    if (dot) {
      dot.style.background = running ? "var(--neon-green)" : "var(--neon-red)";
      dot.style.boxShadow = running
        ? "0 0 10px rgba(0, 255, 136, 0.5)"
        : "0 0 10px rgba(255, 51, 102, 0.5)";
    }
    if (text) text.textContent = running ? "Monitor ativo" : "Monitor inativo";
  },

  updateConnection(status) {
    const badge = document.getElementById("tg-connection-badge");
    if (!badge) return;

    const { telegramConnected, hasSession, configured } = status;

    if (telegramConnected) {
      badge.className = "badge badge-success";
      badge.innerHTML = '<i class="ph ph-check-circle"></i> Conectado';
    } else if (hasSession) {
      badge.className = "badge badge-warning";
      badge.innerHTML = '<i class="ph ph-clock"></i> Autenticado (ocioso)';
    } else if (configured) {
      badge.className = "badge badge-info";
      badge.innerHTML = '<i class="ph ph-info"></i> Configurado';
    } else {
      badge.className = "badge badge-danger";
      badge.innerHTML = '<i class="ph ph-x-circle"></i> Não conectado';
    }
  },

  updateFilterMode(active, totalFilters) {
    const statusEl = document.getElementById("filter-mode-status");
    const btnEl = document.getElementById("filter-mode-btn");
    const descEl = document.getElementById("filter-mode-desc");

    if (statusEl) {
      statusEl.textContent = active ? "FILTRADO" : "SEM FILTRO";
      statusEl.style.color = active ? "var(--neon-yellow)" : "var(--neon-cyan)";
    }
    if (btnEl) {
      btnEl.innerHTML = active
        ? '<i class="ph ph-funnel"></i> Desativar Filtros'
        : '<i class="ph ph-funnel"></i> Ativar Filtros';
    }
    if (descEl) {
      descEl.textContent = active
        ? `${totalFilters} filtros ativos - Enviando apenas promoções filtradas`
        : "Modo automático - Enviando todas as promoções";
    }
  },
};
