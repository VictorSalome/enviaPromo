import re

with open("/home/ubuntu/enviaPromo/public/index.html", "r") as f:
    html = f.read()

# Add Toast and CRUD functions before initialization
functions_js = """
    // ============== TOAST NOTIFICATIONS ==============
    function showToast(message, type, duration) {
      duration = duration || 3000;
      const container = document.getElementById('toastContainer');
      const toast = document.createElement('div');
      toast.className = 'toast toast-' + type;
      const icons = {
        success: '<i class="ph ph-check-circle" style="font-size: 20px;"></i>',
        error: '<i class="ph ph-x-circle" style="font-size: 20px;"></i>',
        warning: '<i class="ph ph-warning" style="font-size: 20px;"></i>',
        info: '<i class="ph ph-info" style="font-size: 20px;"></i>'
      };
      toast.innerHTML = (icons[type] || icons.info) + '<span>' + message + '</span>';
      container.appendChild(toast);
      setTimeout(function() {
        toast.classList.add('toast-hiding');
        setTimeout(function() { toast.remove(); }, 300);
      }, duration);
    }

    // ============== PRICE ALERTS EDIT ==============
    let editingAlertId = null;
    async function editPriceAlert(id) {
      try {
        const res = await fetch('/api/price-alerts', { credentials: 'include' });
        const data = await res.json();
        const alert = data.data.find(function(a) { return a.id === id; });
        if (!alert) return;
        editingAlertId = id;
        document.getElementById('alert-product').value = alert.product_name || alert.product || '';
        document.getElementById('alert-price').value = alert.target_price || '';
        const btn = document.querySelector('#section-price-alerts button[onclick^="addPriceAlert"]');
        if (btn) {
          btn.innerHTML = '<i class="ph ph-floppy-disk"></i> Atualizar';
          btn.setAttribute('onclick', 'updatePriceAlert(' + id + ')');
        }
        showToast('Editando alerta...', 'info');
      } catch (err) {
        showToast('Erro ao carregar alerta', 'error');
      }
    }
    async function updatePriceAlert(id) {
      const productName = document.getElementById('alert-product').value;
      const price = document.getElementById('alert-price').value;
      if (!productName || !price) {
        showToast('Preencha todos os campos', 'warning');
        return;
      }
      try {
        const res = await fetch('/api/price-alerts/' + id, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ productName: productName, targetPrice: parseFloat(price) })
        });
        const data = await res.json();
        if (data.success) {
          showToast('Alerta atualizado!', 'success');
          document.getElementById('alert-product').value = '';
          document.getElementById('alert-price').value = '';
          editingAlertId = null;
          const btn = document.querySelector('#section-price-alerts button[onclick^="updatePriceAlert"]');
          if (btn) {
            btn.innerHTML = '<i class="ph ph-plus"></i> Adicionar';
            btn.setAttribute('onclick', 'addPriceAlert()');
          }
          loadPriceAlerts();
        } else {
          showToast(data.message || 'Erro ao atualizar', 'error');
        }
      } catch (err) {
        showToast('Erro ao atualizar alerta', 'error');
      }
    }
    async function deletePriceAlert(id) {
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
    }

    // ============== CATEGORIES CRUD ==============
    let editingCategoryId = null;
    async function editCategory(id) {
      try {
        const res = await fetch('/api/filters', { credentials: 'include' });
        const data = await res.json();
        const cat = data.data.find(function(c) { return c.id === id; });
        if (!cat) return;
        editingCategoryId = id;
        document.getElementById('new-category-name').value = cat.name || '';
        document.getElementById('new-category-color').value = cat.color || '#00f0ff';
        const btn = document.querySelector('#section-filters button[onclick^="addCategory"]');
        if (btn) {
          btn.innerHTML = '<i class="ph ph-floppy-disk"></i> Atualizar';
          btn.setAttribute('onclick', 'updateCategory(' + id + ')');
        }
        showToast('Editando categoria...', 'info');
      } catch (err) {
        showToast('Erro ao carregar categoria', 'error');
      }
    }
    async function updateCategory(id) {
      const name = document.getElementById('new-category-name').value;
      const color = document.getElementById('new-category-color').value;
      if (!name) {
        showToast('Digite o nome da categoria', 'warning');
        return;
      }
      try {
        const res = await fetch('/api/filters/categories/' + id, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ name: name, color: color })
        });
        const data = await res.json();
        if (data.success) {
          showToast('Categoria atualizada!', 'success');
          document.getElementById('new-category-name').value = '';
          editingCategoryId = null;
          const btn = document.querySelector('#section-filters button[onclick^="updateCategory"]');
          if (btn) {
            btn.innerHTML = '<i class="ph ph-plus"></i> Criar';
            btn.setAttribute('onclick', 'addCategory()');
          }
          renderFilters();
        } else {
          showToast(data.message || 'Erro ao atualizar', 'error');
        }
      } catch (err) {
        showToast('Erro ao atualizar categoria', 'error');
      }
    }
    async function deleteCategory(id) {
      const result = await Swal.fire({
        icon: 'warning',
        title: 'Confirmar Exclusao',
        text: 'Deseja remover esta categoria? Todos os filtros serao removidos.',
        showCancelButton: true,
        confirmButtonText: 'Sim, remover',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#ff3366'
      });
      if (!result.isConfirmed) return;
      try {
        await fetch('/api/filters/categories/' + id, { method: 'DELETE', credentials: 'include' });
        showToast('Categoria removida!', 'success');
        renderFilters();
      } catch (err) {
        showToast('Erro ao remover categoria', 'error');
      }
    }

    // ============== FILTERS CRUD ==============
    async function addFilterToCategory(categoryId) {
      const name = document.getElementById('filter-name-' + categoryId).value;
      const type = document.getElementById('filter-type-' + categoryId).value;
      const keywords = document.getElementById('filter-keywords-' + categoryId).value;
      if (!name || !keywords) {
        showToast('Preencha nome e keywords', 'warning');
        return;
      }
      try {
        const res = await fetch('/api/filters', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ categoryId: categoryId, name: name, type: type, keywords: keywords })
        });
        const data = await res.json();
        if (data.success) {
          showToast('Filtro adicionado!', 'success');
          document.getElementById('filter-name-' + categoryId).value = '';
          document.getElementById('filter-keywords-' + categoryId).value = '';
          renderFilters();
        } else {
          showToast(data.message || 'Erro ao adicionar', 'error');
        }
      } catch (err) {
        showToast('Erro ao adicionar filtro', 'error');
      }
    }
    async function editFilter(id) {
      try {
        const res = await fetch('/api/filters', { credentials: 'include' });
        const data = await res.json();
        let filter = null;
        for (let i = 0; i < data.data.length; i++) {
          filter = data.data[i].filters.find(function(f) { return f.id === id; });
          if (filter) break;
        }
        if (!filter) return;
        const { value: formValues } = await Swal.fire({
          title: 'Editar Filtro',
          html: '<input id="swal-filter-name" class="swal2-input" placeholder="Nome" value="' + filter.name + '">' +
                '<select id="swal-filter-type" class="swal2-input" style="margin-top: 10px;">' +
                '<option value="broad"' + (filter.type === 'broad' ? ' selected' : '') + '>Amplo (OR)</option>' +
                '<option value="specific"' + (filter.type === 'specific' ? ' selected' : '') + '>Especifico (AND)</option>' +
                '</select>' +
                '<input id="swal-filter-keywords" class="swal2-input" placeholder="Keywords (separadas por virgula)" value="' + filter.keywords + '">',
          focusConfirm: false,
          showCancelButton: true,
          confirmButtonText: 'Atualizar',
          cancelButtonText: 'Cancelar',
          preConfirm: function() {
            return {
              name: document.getElementById('swal-filter-name').value,
              type: document.getElementById('swal-filter-type').value,
              keywords: document.getElementById('swal-filter-keywords').value
            };
          }
        });
        if (!formValues) return;
        const updateRes = await fetch('/api/filters/' + id, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(formValues)
        });
        const updateData = await updateRes.json();
        if (updateData.success) {
          showToast('Filtro atualizado!', 'success');
          renderFilters();
        } else {
          showToast(updateData.message || 'Erro ao atualizar', 'error');
        }
      } catch (err) {
        showToast('Erro ao editar filtro', 'error');
      }
    }
    async function deleteFilter(id) {
      const result = await Swal.fire({
        icon: 'warning',
        title: 'Confirmar Exclusao',
        text: 'Deseja remover este filtro?',
        showCancelButton: true,
        confirmButtonText: 'Sim, remover',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#ff3366'
      });
      if (!result.isConfirmed) return;
      try {
        await fetch('/api/filters/' + id, { method: 'DELETE', credentials: 'include' });
        showToast('Filtro removido!', 'success');
        renderFilters();
      } catch (err) {
        showToast('Erro ao remover filtro', 'error');
      }
    }
"""

init_marker = "// ============== INITIALIZATION =============="
html = html.replace(init_marker, functions_js + "\n" + init_marker)

with open("/home/ubuntu/enviaPromo/public/index.html", "w") as f:
    f.write(html)

print("Funcoes CRUD adicionadas")
