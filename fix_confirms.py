import re

with open("/home/ubuntu/enviaPromo/public/index.html", "r") as f:
    html = f.read()

# Replace deleteChannel old version
old_delete_channel = """    async function deleteChannel(id) {
      if (!confirm('Remover este canal?')) return;
      try {
        await fetch('/api/channels/' + id, { method: 'DELETE', credentials: 'include' });
        loadChannels();
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'Erro', text: 'Erro ao remover canal' });
      }
    }"""

new_delete_channel = """    async function deleteChannel(id) {
      const result = await Swal.fire({
        icon: 'warning',
        title: 'Confirmar Exclusao',
        text: 'Deseja remover este canal?',
        showCancelButton: true,
        confirmButtonText: 'Sim, remover',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#ff3366'
      });
      if (!result.isConfirmed) return;
      try {
        await fetch('/api/channels/' + id, { method: 'DELETE', credentials: 'include' });
        showToast('Canal removido!', 'success');
        loadChannels();
      } catch (err) {
        showToast('Erro ao remover canal', 'error');
      }
    }"""

html = html.replace(old_delete_channel, new_delete_channel)

# Replace deletePriceAlert old version  
old_delete_alert = """    async function deletePriceAlert(id) {
      if (!confirm('Remover este alerta?')) return;
      try {
        await fetch('/api/price-alerts/' + id, { method: 'DELETE', credentials: 'include' });
        loadPriceAlerts();
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'Erro', text: 'Erro ao remover alerta' });
      }
    }"""

new_delete_alert = """    async function deletePriceAlert(id) {
      const result = await Swal.fire({
        icon: 'warning',
        title: 'Confirmar Exclusao',
        text: 'Deseja remover este alerta de preco?',
        showCancelButton: true,
        confirmButtonText: 'Sim, remover',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#ff3366'
      });
      if (!result.isConfirmed) return;
      try {
        await fetch('/api/price-alerts/' + id, { method: 'DELETE', credentials: 'include' });
        showToast('Alerta removido!', 'success');
        loadPriceAlerts();
      } catch (err) {
        showToast('Erro ao remover alerta', 'error');
      }
    }"""

html = html.replace(old_delete_alert, new_delete_alert)

with open("/home/ubuntu/enviaPromo/public/index.html", "w") as f:
    f.write(html)

print("Confirm alerts replaced with SweetAlert2")
