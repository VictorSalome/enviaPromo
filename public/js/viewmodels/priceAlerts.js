// ========== PRICE ALERTS VIEWMODEL ==========

let _editingAlertId = null;

const PriceAlertsVM = {
  async load() {
    const alerts = await PriceAlertModel.list();
    PriceAlertsView.render(alerts);
  },

  async add() {
    const name = document.getElementById("alert-product")?.value?.trim();
    const price = parseFloat(document.getElementById("alert-price")?.value);

    if (!name) {
      showToast("Nome do produto é obrigatório", "warning");
      return;
    }
    if (!price || price <= 0) {
      showToast("Preço inválido", "warning");
      return;
    }

    try {
      if (_editingAlertId) {
        await PriceAlertModel.update(_editingAlertId, { productName: name, targetPrice: price });
        _editingAlertId = null;
        showToast("Alerta atualizado!", "success");
      } else {
        await PriceAlertModel.create({ productName: name, targetPrice: price });
        showToast("Alerta criado!", "success");
      }
      document.getElementById("alert-product").value = "";
      document.getElementById("alert-price").value = "";
      this.load();
    } catch (err) {
      showToast(err.message || "Erro ao salvar alerta", "error");
    }
  },

  async edit(id) {
    const alerts = await PriceAlertModel.list();
    const alert = alerts.find((a) => a.id === id);
    if (!alert) return;

    _editingAlertId = id;
    document.getElementById("alert-product").value = alert.product_name;
    document.getElementById("alert-price").value = alert.target_price;
  },

  async remove(id) {
    const confirmed = await confirmDialog("Remover alerta?");
    if (!confirmed) return;

    try {
      await PriceAlertModel.remove(id);
      showToast("Alerta removido!", "success");
      this.load();
    } catch (err) {
      showToast("Erro ao remover alerta", "error");
    }
  },
};
