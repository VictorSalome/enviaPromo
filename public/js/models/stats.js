// ========== STATS MODEL ==========

const StatsModel = {
  async overview() {
    const data = await apiGet("/api/stats/overview");
    return data.data || {};
  },
};
