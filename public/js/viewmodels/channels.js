// ========== CHANNELS VIEWMODEL ==========

const ChannelsVM = {
  async load() {
    const channels = await ChannelModel.list();
    ChannelsView.render(channels);
  },

  async add() {
    const input = document.getElementById("channel-input");
    const username = input?.value?.trim();
    if (!username) return;

    try {
      await ChannelModel.create(username);
      input.value = "";
      showToast("Canal adicionado!", "success");
      this.load();
    } catch (err) {
      showToast(err.message || "Erro ao adicionar canal", "error");
    }
  },

  async toggle(id) {
    try {
      await ChannelModel.toggle(id);
      this.load();
    } catch (err) {
      showToast("Erro ao alterar status", "error");
    }
  },

  async remove(id) {
    const confirmed = await confirmDialog("Remover canal?", "Esta ação não pode ser desfeita.");
    if (!confirmed) return;

    try {
      await ChannelModel.remove(id);
      showToast("Canal removido!", "success");
      this.load();
    } catch (err) {
      showToast("Erro ao remover canal", "error");
    }
  },
};
