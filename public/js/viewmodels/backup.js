// ========== BACKUP VIEWMODEL ==========

const BackupVM = {
  async exportConfig() {
    try {
      await BackupModel.exportConfig();
      showToast("Backup exportado com sucesso!", "success");
    } catch (err) {
      showToast("Erro ao exportar backup", "error");
    }
  },
};
