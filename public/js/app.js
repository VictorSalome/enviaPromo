// ========== APP INIT ==========

let currentUser = null;

// Verificar autenticação
async function checkAuth() {
  try {
    const data = await apiGet("/api/auth/me");
    currentUser = data.user;
    const nameEl = document.getElementById("user-name-display");
    if (nameEl) nameEl.textContent = currentUser.username;
  } catch {
    window.location.href = "/login";
  }
}

// Navegação
function navigate(section) {
  // Esconder todas as seções
  document.querySelectorAll(".section").forEach((s) => s.classList.remove("active"));

  // Mostrar seção alvo
  const target = document.getElementById(`section-${section}`);
  if (target) target.classList.add("active");

  // Atualizar nav items
  document.querySelectorAll(".nav-item").forEach((n) => n.classList.remove("active"));
  const navItem = document.querySelector(`[data-section="${section}"]`);
  if (navItem) navItem.classList.add("active");

  // Atualizar título
  const titles = {
    dashboard: "Dashboard",
    telegram: "Configuração do Telegram",
    discord: "Configuração do Discord",
    channels: "Canais Monitorados",
    filters: "Filtros e Categorias",
    monitor: "Controle do Monitor",
    "price-alerts": "Alertas de Preço",
    stats: "Estatísticas",
    backup: "Backup",
  };
  const titleEl = document.getElementById("page-title");
  if (titleEl) titleEl.textContent = titles[section] || section;

  // Fechar sidebar no mobile
  document.querySelector(".sidebar")?.classList.remove("open");
  document.querySelector(".sidebar-overlay")?.classList.remove("show");

  // Carregar dados da seção
  loadSectionData(section);
}

// Carregar dados por seção
async function loadSectionData(section) {
  switch (section) {
    case "dashboard":
      StatsVM.load();
      break;
    case "channels":
      ChannelsVM.load();
      break;
    case "filters":
      FiltersVM.load();
      break;
    case "monitor":
      MonitorVM.load();
      break;
    case "telegram":
      TelegramVM.load();
      break;
    case "price-alerts":
      PriceAlertsVM.load();
      break;
    case "stats":
      StatsVM.load();
      break;
  }
}

// Toggle sidebar mobile
function toggleSidebar() {
  document.querySelector(".sidebar")?.classList.toggle("open");
  document.querySelector(".sidebar-overlay")?.classList.toggle("show");
}

// Logout
async function logout() {
  try {
    await apiPost("/api/auth/logout");
  } catch {}
  window.location.href = "/login";
}

// Discord test
async function testDiscord() {
  showToast("Testando Discord...", "info");
  try {
    await DiscordModel.test();
    showToast("Mensagem enviada ao Discord!", "success");
  } catch (err) {
    showToast("Erro ao testar Discord: " + err.message, "error");
  }
}

// ========== INIT ==========
document.addEventListener("DOMContentLoaded", async () => {
  await checkAuth();

  // Navegação da sidebar
  document.querySelectorAll(".nav-item[data-section]").forEach((item) => {
    item.addEventListener("click", () => navigate(item.dataset.section));
  });

  // Carregar dashboard por padrão
  navigate("dashboard");

  // Iniciar polling do monitor
  MonitorVM.startPolling();
});
