// ========== MONITOR MODEL ==========

const MonitorModel = {
  async status() {
    const data = await apiGet("/api/monitor/status");
    return data.data || { running: false };
  },

  async connectionStatus() {
    const data = await apiGet("/api/monitor/connection-status");
    return data.data || {};
  },

  async start() {
    return apiPost("/api/monitor/start");
  },

  async stop() {
    return apiPost("/api/monitor/stop");
  },

  async testFlow() {
    const data = await apiPost("/api/monitor/test-flow");
    return data.data || {};
  },
};
