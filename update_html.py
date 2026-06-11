import re

with open("/home/ubuntu/enviaPromo/public/index.html", "r") as f:
    html = f.read()

# Encontrar o local para inserir o card de modo de captura (depois do card de status do monitor)
old_monitor_section = """          <div class="card">
            <div class="card-header">
              <div class="card-title">
                <i class="ph ph-test-tube"></i>
                Testes
              </div>
            </div>"""

new_monitor_section = """          <div class="card mb-6">
            <div class="card-body">
              <div class="card-title mb-4" style="display: flex; align-items: center; gap: 8px;">
                <i class="ph ph-faders"></i>
                Modo de Captura
              </div>
              
              <div id="filter-mode-container" style="background: rgba(0, 240, 255, 0.05); border: 1px solid rgba(0, 240, 255, 0.2); border-radius: 4px; padding: 20px;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
                  <div>
                    <div style="font-family: 'Rajdhani', sans-serif; font-weight: 600; font-size: 16px; color: var(--neon-cyan); letter-spacing: 1px; margin-bottom: 4px;">
                      Filtros
                    </div>
                    <div id="filter-mode-status" style="font-size: 14px; color: var(--text-muted);">
                      Carregando...
                    </div>
                  </div>
                  <button id="filter-mode-toggle" onclick="toggleFilterMode()" class="btn btn-outline" style="min-width: 140px;">
                    <i class="ph ph-toggle-left"></i>
                    <span id="filter-mode-btn-text">Carregando...</span>
                  </button>
                </div>
                
                <div style="font-size: 13px; color: var(--text-muted); line-height: 1.5;">
                  <i class="ph ph-info" style="color: var(--neon-cyan);"></i>
                  <span id="filter-mode-description">
                    Quando desativado, todas as mensagens dos canais serão enviadas para o WhatsApp sem filtragem.
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <div class="card-title">
                <i class="ph ph-test-tube"></i>
                Testes
              </div>
            </div>"""

html = html.replace(old_monitor_section, new_monitor_section)

# Adicionar funções JavaScript para o toggle de filtros
old_init = "// ============== INITIALIZATION =============="

new_functions = """
    // ============== FILTER MODE TOGGLE ==============
    let filtersActive = true;
    let totalFilters = 0;
    let activeFilters = 0;

    async function loadFilterStats() {
      try {
        const res = await fetch("/api/filters/stats", { credentials: "include" });
        const data = await res.json();
        if (data.success) {
          activeFilters = data.data.active;
          totalFilters = data.data.total;
          filtersActive = activeFilters > 0;
          updateFilterModeUI();
        }
      } catch (err) {
        console.error("Erro ao carregar estatísticas de filtros");
      }
    }

    function updateFilterModeUI() {
      const statusEl = document.getElementById("filter-mode-status");
      const btnTextEl = document.getElementById("filter-mode-btn-text");
      const descEl = document.getElementById("filter-mode-description");
      const container = document.getElementById("filter-mode-container");
      
      if (filtersActive) {
        statusEl.innerHTML = '<span style="color: var(--neon-green);"><i class="ph ph-check-circle"></i> ' + activeFilters + "/" + totalFilters + " filtros ativos</span>";
        btnTextEl.textContent = "Desativar Todos";
        descEl.textContent = "Apenas mensagens que correspondem aos filtros serão enviadas para o WhatsApp.";
        container.style.borderColor = "rgba(0, 255, 136, 0.3)";
        container.style.background = "rgba(0, 255, 136, 0.05)";
      } else {
        statusEl.innerHTML = '<span style="color: var(--neon-red);"><i class="ph ph-x-circle"></i> Sem filtros (' + totalFilters + " desativados)</span>";
        btnTextEl.textContent = "Ativar Todos";
        descEl.textContent = "TODAS as mensagens dos canais serão enviadas para o WhatsApp sem filtragem.";
        container.style.borderColor = "rgba(255, 51, 102, 0.3)";
        container.style.background = "rgba(255, 51, 102, 0.05)";
      }
    }

    async function toggleFilterMode() {
      const newState = !filtersActive;
      
      const result = await Swal.fire({
        icon: "warning",
        title: newState ? "Ativar todos os filtros?" : "Desativar todos os filtros?",
        text: newState 
          ? "Apenas mensagens que correspondem aos filtros serão enviadas para o WhatsApp."
          : "TODAS as mensagens dos canais serão enviadas para o WhatsApp sem filtragem. Isso pode gerar muitas notificações.",
        showCancelButton: true,
        confirmButtonText: newState ? "Sim, ativar" : "Sim, desativar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: newState ? "#00ff88" : "#ff3366"
      });
      
      if (!result.isConfirmed) return;
      
      try {
        const res = await fetch("/api/filters/toggle-all", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ isActive: newState })
        });
        const data = await res.json();
        
        if (data.success) {
          filtersActive = newState;
          activeFilters = newState ? totalFilters : 0;
          updateFilterModeUI();
          showToast(data.message, "success");
          
          // Recarregar estatísticas para confirmar
          setTimeout(loadFilterStats, 500);
        } else {
          showToast(data.message || "Erro ao alterar filtros", "error");
        }
      } catch (err) {
        showToast("Erro ao comunicar com o servidor", "error");
      }
    }
"""

html = html.replace(old_init, new_functions + "\n" + old_init)

# Atualizar a função de navegação para carregar estatísticas de filtros
old_navigate = """      if (section === "telegram") loadTelegramConfig();"""

new_navigate = """      if (section === "telegram") loadTelegramConfig();
      if (section === "monitor") loadFilterStats();"""

html = html.replace(old_navigate, new_navigate)

with open("/home/ubuntu/enviaPromo/public/index.html", "w") as f:
    f.write(html)

print("HTML atualizado com sucesso!")
