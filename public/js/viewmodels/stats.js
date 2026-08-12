// ========== STATS VIEWMODEL ==========

const StatsVM = {
  async load() {
    const stats = await StatsModel.overview();
    StatsView.render(stats);
  },
};
