// ========== CHANNEL MODEL ==========

const ChannelModel = {
  async list() {
    const data = await apiGet("/api/channels");
    return data.data || [];
  },

  async create(username) {
    return apiPost("/api/channels", { username });
  },

  async toggle(id) {
    return apiPost(`/api/channels/${id}/toggle`);
  },

  async remove(id) {
    return apiDelete(`/api/channels/${id}`);
  },
};
