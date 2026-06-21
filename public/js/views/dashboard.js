// ========== DASHBOARD VIEW ==========

const DashboardView = {
  render(stats) {
    const dashboardToday = document.getElementById("dashboard-today");
    const dashboardChannels = document.getElementById("dashboard-channels");
    const dashboardFilters = document.getElementById("dashboard-filters");
    const dashboardStatus = document.getElementById("dashboard-status");

    if (dashboardToday) dashboardToday.textContent = stats.today || 0;
    if (dashboardChannels) dashboardChannels.textContent = stats.activeChannels || 0;
    if (dashboardFilters) dashboardFilters.textContent = stats.activeFilters || 0;
    if (dashboardStatus) {
      dashboardStatus.textContent = "Online";
      dashboardStatus.style.color = "var(--neon-green)";
    }
  },
};
