// ========== STATS VIEW ==========

const StatsView = {
  render(stats) {
    // Stats page
    const today = document.getElementById("stat-today");
    const week = document.getElementById("stat-week");
    const month = document.getElementById("stat-month");
    const channels = document.getElementById("stat-channels-count");
    const filters = document.getElementById("stat-filters-count");

    if (today) today.textContent = stats.today || 0;
    if (week) week.textContent = stats.week || 0;
    if (month) month.textContent = stats.month || 0;
    if (channels) channels.textContent = stats.activeChannels || 0;
    if (filters) filters.textContent = stats.activeFilters || 0;

    // Dashboard
    const dashToday = document.getElementById("dashboard-today");
    const dashChannels = document.getElementById("dashboard-channels");
    const dashFilters = document.getElementById("dashboard-filters");
    const dashStatus = document.getElementById("dashboard-status");

    if (dashToday) dashToday.textContent = stats.today || 0;
    if (dashChannels) dashChannels.textContent = stats.activeChannels || 0;
    if (dashFilters) dashFilters.textContent = stats.activeFilters || 0;
    if (dashStatus) {
      dashStatus.textContent = "Online";
      dashStatus.style.color = "var(--neon-green)";
    }
  },
};
