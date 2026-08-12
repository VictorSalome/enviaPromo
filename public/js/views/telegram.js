// ========== TELEGRAM VIEW ==========

const TelegramView = {
  renderConfig(config) {
    const apiId = document.getElementById("tg-api-id");
    const apiHash = document.getElementById("tg-api-hash");
    const phone = document.getElementById("tg-phone");
    const statusBadge = document.getElementById("tg-status-badge");

    if (apiId) apiId.value = config.api_id || "";
    if (apiHash) apiHash.value = config.api_hash || "";
    if (phone) phone.value = config.phone || "";

    if (statusBadge) {
      if (config.is_connected) {
        statusBadge.className = "badge badge-success";
        statusBadge.innerHTML = '<i class="ph ph-check-circle"></i> Conectado';
      } else if (config.session_string) {
        statusBadge.className = "badge badge-warning";
        statusBadge.innerHTML = '<i class="ph ph-clock"></i> Sessão existe';
      } else {
        statusBadge.className = "badge badge-danger";
        statusBadge.innerHTML = '<i class="ph ph-x-circle"></i> Não conectado';
      }
    }
  },

  showCodeInput(show) {
    const section = document.getElementById("tg-code-section");
    if (section) section.style.display = show ? "block" : "none";
  },
};
