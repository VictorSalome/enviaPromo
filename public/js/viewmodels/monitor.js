// ========== MONITOR VIEWMODEL ==========

let _monitorPollInterval = null;
let _connectionPollInterval = null;

const MonitorVM = {
  async load() {
    const status = await MonitorModel.status();
    MonitorView.updateRunning(status.running);
    await this.loadConnection();
  },

  async loadConnection() {
    try {
      const conn = await MonitorModel.connectionStatus();
      MonitorView.updateConnection(conn);
    } catch {
      MonitorView.updateConnection({});
    }
  },

  async toggle() {
    try {
      const status = await MonitorModel.status();
      if (status.running) {
        await MonitorModel.stop();
        showToast("Monitor parado", "warning");
      } else {
        await MonitorModel.start();
        showToast("Monitor iniciado!", "success");
      }
      this.load();
    } catch (err) {
      showToast(err.message || "Erro ao controlar monitor", "error");
    }
  },

  async testFlow() {
    const btn = document.getElementById("monitor-test-btn");
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Testando...';
    }
    try {
      const result = await MonitorModel.testFlow();
      const tg = result.telegram || "—";
      const dc = result.discord || "—";
      showToast(`🤖 TG: ${tg}\n💬 DC: ${dc}`, result.telegram ? "success" : "warning", 5000);
    } catch (err) {
      showToast("Erro no teste: " + err.message, "error");
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i class="ph ph-paper-plane-right"></i> Testar Fluxo Completo';
      }
    }
  },

  startPolling() {
    _monitorPollInterval = setInterval(() => this.load(), 5000);
    _connectionPollInterval = setInterval(() => this.loadConnection(), 10000);
  },

  stopPolling() {
    clearInterval(_monitorPollInterval);
    clearInterval(_connectionPollInterval);
  },
};
