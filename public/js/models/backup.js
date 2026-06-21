// ========== BACKUP MODEL ==========

const BackupModel = {
  async exportConfig() {
    const res = await fetch("/api/backup/export", { credentials: "include" });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "promo-monitor-backup.json";
    a.click();
    URL.revokeObjectURL(url);
  },
};
