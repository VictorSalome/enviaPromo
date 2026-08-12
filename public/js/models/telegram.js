// ========== TELEGRAM MODEL ==========

const TelegramModel = {
  async getConfig() {
    const data = await apiGet("/api/telegram-config");
    return data.data || {};
  },

  async saveConfig({ apiId, apiHash, phone }) {
    return apiPost("/api/telegram-config", { apiId, apiHash, phone });
  },

  async authStatus() {
    const data = await apiGet("/api/telegram-config/auth-status");
    return data.data || {};
  },

  async startAuth() {
    return apiPost("/api/telegram-config/auth/start");
  },

  async verifyCode(code) {
    return apiPost("/api/telegram-config/auth/verify", { code });
  },
};
