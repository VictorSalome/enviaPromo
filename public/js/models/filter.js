// ========== FILTER MODEL ==========

const FilterModel = {
  async list() {
    const data = await apiGet("/api/filters");
    return data.data || [];
  },

  async stats() {
    const data = await apiGet("/api/filters/stats");
    return data.data || { active: 0, total: 0 };
  },

  async createCategory({ name, color, icon }) {
    return apiPost("/api/filters/categories", { name, color, icon });
  },

  async updateCategory(id, { name, color }) {
    return apiPut(`/api/filters/categories/${id}`, { name, color });
  },

  async deleteCategory(id) {
    return apiDelete(`/api/filters/categories/${id}`);
  },

  async createFilter({ categoryId, name, type, keywords }) {
    return apiPost("/api/filters", { categoryId, name, type, keywords });
  },

  async updateFilter(id, { name, type, keywords }) {
    return apiPut(`/api/filters/${id}`, { name, type, keywords });
  },

  async deleteFilter(id) {
    return apiDelete(`/api/filters/${id}`);
  },

  async toggleFilter(id) {
    return apiPost(`/api/filters/${id}/toggle`);
  },

  async toggleAll(isActive) {
    return apiPost("/api/filters/toggle-all", { isActive });
  },
};
