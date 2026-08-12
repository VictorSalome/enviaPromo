// ========== UTILITIES ==========

// Toast notifications
function showToast(message, type = "info", duration = 3000) {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const icons = {
    success: "ph-check-circle",
    error: "ph-x-circle",
    warning: "ph-warning",
    info: "ph-info",
  };

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<i class="ph ${icons[type] || icons.info}"></i><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("toast-hiding");
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// Format currency BRL
function formatBRL(value) {
  if (!value) return "R$ 0,00";
  return `R$ ${Number(value).toFixed(2).replace(".", ",")}`;
}

// Sanitize HTML (prevent XSS)
function sanitize(str) {
  if (!str) return "";
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// Debounce
function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// Confirm dialog (SweetAlert2)
async function confirmDialog(title, text, confirmText = "Confirmar") {
  const result = await Swal.fire({
    title,
    text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#ff3366",
    cancelButtonColor: "#00f0ff",
    confirmButtonText: confirmText,
    cancelButtonText: "Cancelar",
  });
  return result.isConfirmed;
}
