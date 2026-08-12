// ========== FILTERS VIEWMODEL ==========

let _editingCategoryId = null;
let _editingFilterId = null;

const FiltersVM = {
  async load() {
    const categories = await FilterModel.list();
    FiltersView.render(categories);
    await this.loadStats();
  },

  async loadStats() {
    const stats = await FilterModel.stats();
    MonitorView.updateFilterMode(stats.active > 0, stats.total);
  },

  async addCategory() {
    const name = document.getElementById("cat-name")?.value?.trim();
    const color = document.getElementById("cat-color")?.value || "#3b82f6";
    const icon = document.getElementById("cat-icon")?.value || "📁";

    if (!name) {
      showToast("Nome da categoria é obrigatório", "warning");
      return;
    }

    try {
      if (_editingCategoryId) {
        await FilterModel.updateCategory(_editingCategoryId, { name, color });
        _editingCategoryId = null;
        showToast("Categoria atualizada!", "success");
      } else {
        await FilterModel.createCategory({ name, color, icon });
        showToast("Categoria criada!", "success");
      }
      document.getElementById("cat-name").value = "";
      this.load();
    } catch (err) {
      showToast(err.message || "Erro ao salvar categoria", "error");
    }
  },

  async editCategory(id) {
    const categories = await FilterModel.list();
    const cat = categories.find((c) => c.id === id);
    if (!cat) return;

    _editingCategoryId = id;
    document.getElementById("cat-name").value = cat.name;
    document.getElementById("cat-color").value = cat.color || "#3b82f6";
    document.getElementById("cat-icon").value = cat.icon || "📁";
  },

  async removeCategory(id) {
    const confirmed = await confirmDialog("Remover categoria?", "Todos os filtros desta categoria serão removidos.");
    if (!confirmed) return;

    try {
      await FilterModel.deleteCategory(id);
      showToast("Categoria removida!", "success");
      this.load();
    } catch (err) {
      showToast("Erro ao remover categoria", "error");
    }
  },

  async addFilter(categoryId) {
    const name = prompt("Nome do filtro:");
    if (!name) return;

    const typeStr = prompt("Tipo (specific/broad):", "broad");
    const type = typeStr === "specific" ? "specific" : "broad";

    const keywordsStr = prompt("Keywords (separadas por vírgula):");
    if (!keywordsStr) return;

    const keywords = keywordsStr.split(",").map((k) => k.trim()).filter(Boolean);

    try {
      await FilterModel.createFilter({ categoryId, name, type, keywords });
      showToast("Filtro criado!", "success");
      this.load();
    } catch (err) {
      showToast(err.message || "Erro ao criar filtro", "error");
    }
  },

  async editFilter(id) {
    showToast("Edição de filtro via modal em desenvolvimento", "info");
  },

  async removeFilter(id) {
    const confirmed = await confirmDialog("Remover filtro?");
    if (!confirmed) return;

    try {
      await FilterModel.deleteFilter(id);
      showToast("Filtro removido!", "success");
      this.load();
    } catch (err) {
      showToast("Erro ao remover filtro", "error");
    }
  },

  async toggleAll() {
    const stats = await FilterModel.stats();
    const newActive = stats.active === 0;

    const confirmed = await confirmDialog(
      newActive ? "Ativar filtros?" : "Desativar filtros?",
      newActive ? "Todas as promoções serão filtradas" : "Todas as promoções serão enviadas"
    );
    if (!confirmed) return;

    try {
      await FilterModel.toggleAll(newActive);
      showToast(newActive ? "Filtros ativados!" : "Filtros desativados!", "success");
      setTimeout(() => this.loadStats(), 500);
    } catch (err) {
      showToast("Erro ao alterar filtros", "error");
    }
  },
};
