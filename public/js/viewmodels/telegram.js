// ========== TELEGRAM VIEWMODEL ==========

const TelegramVM = {
  async load() {
    const config = await TelegramModel.getConfig();
    TelegramView.renderConfig(config);
    await this.loadAuthStatus();
  },

  async loadAuthStatus() {
    try {
      const status = await TelegramModel.authStatus();
      const badge = document.getElementById("tg-status-badge");
      if (badge) {
        if (status.authenticated) {
          badge.className = "badge badge-success";
          badge.innerHTML = '<i class="ph ph-check-circle"></i> Autenticado';
        } else if (status.codeSent) {
          badge.className = "badge badge-warning";
          badge.innerHTML = '<i class="ph ph-clock"></i> Código enviado';
          TelegramView.showCodeInput(true);
        } else {
          badge.className = "badge badge-danger";
          badge.innerHTML = '<i class="ph ph-x-circle"></i> Não autenticado';
        }
      }
    } catch {
      // Ignorar
    }
  },

  async save() {
    const apiId = document.getElementById("tg-api-id")?.value?.trim();
    const apiHash = document.getElementById("tg-api-hash")?.value?.trim();
    const phone = document.getElementById("tg-phone")?.value?.trim();

    if (!apiId || !apiHash || !phone) {
      showToast("Preencha todos os campos", "warning");
      return;
    }

    try {
      await TelegramModel.saveConfig({ apiId, apiHash, phone });
      showToast("Configuração salva!", "success");
      this.load();
    } catch (err) {
      showToast(err.message || "Erro ao salvar", "error");
    }
  },

  async startAuth() {
    try {
      await TelegramModel.startAuth();
      showToast("Código enviado! Verifique seu Telegram.", "success");
      TelegramView.showCodeInput(true);
    } catch (err) {
      showToast(err.message || "Erro ao enviar código", "error");
    }
  },

  async verifyCode() {
    const code = document.getElementById("tg-code")?.value?.trim();
    if (!code) {
      showToast("Digite o código", "warning");
      return;
    }

    try {
      await TelegramModel.verifyCode(code);
      showToast("Autenticado com sucesso!", "success");
      TelegramView.showCodeInput(false);
      this.load();
    } catch (err) {
      showToast(err.message || "Código inválido", "error");
    }
  },

  async testConnection() {
    showToast("Testando conexão...", "info");
    try {
      await MonitorModel.testFlow();
      showToast("Mensagem enviada ao grupo de teste!", "success");
    } catch (err) {
      showToast("Erro ao testar: " + err.message, "error");
    }
  },
};
