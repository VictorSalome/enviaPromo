// ========== PRICE ALERT MODEL ==========

const PriceAlertModel = {
  async list() {
    const data = await apiGet("/api/price-alerts");
    return data.data || [];
  },

  async create({ productName, targetPrice }) {
    return apiPost("/api/price-alerts", { productName, targetPrice });
  },

  async update(id, { productName, targetPrice }) {
    return apiPut(`/api/price-alerts/${id}`, { productName, targetPrice });
  },

  async remove(id) {
    return apiDelete(`/api/price-alerts/${id}`);
  },
};
