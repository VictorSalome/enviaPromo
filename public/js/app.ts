/**
 * Promo Monitor - Frontend Principal
 * SPA com navegação entre seções
 */

// Estado global
let currentUser: any = null;

// Navegação
const navigate = (section: string): void => {
  document.querySelectorAll('.section').forEach((el) => {
    (el as HTMLElement).style.display = 'none';
  });
  const target = document.getElementById(`section-${section}`);
  if (target) target.style.display = 'block';
  
  // Atualiza menu ativo
  document.querySelectorAll('.menu-item').forEach((el) => {
    el.classList.remove('active');
  });
  const menuItem = document.querySelector(`[data-section="${section}"]`);
  if (menuItem) menuItem.classList.add('active');
  
  // Carrega dados da seção
  loadSectionData(section);
};

// Carrega dados da seção
const loadSectionData = async (section: string): Promise<void> => {
  switch (section) {
    case 'dashboard':
      await loadDashboard();
      break;
    case 'telegram':
      await loadTelegramConfig();
      break;
    case 'channels':
      await loadChannels();
      break;
    case 'filters':
      await loadFilters();
      break;
    case 'monitor':
      await loadMonitor();
      break;
    case 'stats':
      await loadStats();
      break;
    case 'price-alerts':
      await loadPriceAlerts();
      break;
    case 'backup':
      // Não precisa carregar dados
      break;
    case 'discord':
      // Discord configurado via .env
      break;
  }
};

// Dashboard
const loadDashboard = async (): Promise<void> => {
  try {
    const statsRes = await fetch('/api/stats/overview', { credentials: 'include' });
    const stats = await statsRes.json();
    
    if (stats.success) {
      document.getElementById('stat-today')!.textContent = stats.data.today;
      document.getElementById('stat-channels')!.textContent = stats.data.activeChannels;
      document.getElementById('stat-filters')!.textContent = stats.data.activeFilters;
      document.getElementById('stat-status')!.textContent = 'Online';
    }
  } catch (err) {
    console.error('Erro ao carregar dashboard:', err);
  }
};

// Telegram Config
const loadTelegramConfig = async (): Promise<void> => {
  try {
    const res = await fetch('/api/telegram-config', { credentials: 'include' });
    const data = await res.json();
    
    if (data.success && data.data) {
      (document.getElementById('tg-api-id') as HTMLInputElement).value = data.data.api_id || '';
      (document.getElementById('tg-api-hash') as HTMLInputElement).value = data.data.api_hash || '';
      (document.getElementById('tg-phone') as HTMLInputElement).value = data.data.phone || '';
      
      const statusEl = document.getElementById('tg-status')!;
      if (data.data.is_connected) {
        statusEl.textContent = '🟢 Conectado';
        statusEl.className = 'badge badge-success';
      } else {
        statusEl.textContent = '🔴 Desconectado';
        statusEl.className = 'badge badge-error';
      }
    }
  } catch (err) {
    console.error('Erro ao carregar config Telegram:', err);
  }
};

// Canais
const loadChannels = async (): Promise<void> => {
  try {
    const res = await fetch('/api/channels', { credentials: 'include' });
    const data = await res.json();
    
    if (data.success) {
      const tbody = document.getElementById('channels-list')!;
      tbody.innerHTML = data.data.map((ch: any) => `
        <tr>
          <td>${ch.username}</td>
          <td>${ch.name || '-'}</td>
          <td>
            <input type="checkbox" class="toggle toggle-success" ${ch.is_active ? 'checked' : ''} 
              onchange="toggleChannel(${ch.id})">
          </td>
          <td>
            <button class="btn btn-error btn-xs" onclick="deleteChannel(${ch.id})">🗑️</button>
          </td>
        </tr>
      `).join('');
    }
  } catch (err) {
    console.error('Erro ao carregar canais:', err);
  }
};

// Filtros
const loadFilters = async (): Promise<void> => {
  try {
    const res = await fetch('/api/filters', { credentials: 'include' });
    const data = await res.json();
    
    if (data.success) {
      const container = document.getElementById('filters-container')!;
      container.innerHTML = data.data.map((cat: any) => `
        <div class="card bg-base-200 mb-4">
          <div class="card-body">
            <h3 class="card-title text-lg" style="color: ${cat.color}">
              ${cat.icon} ${cat.name}
              <input type="checkbox" class="toggle toggle-sm" ${cat.is_active ? 'checked' : ''}
                onchange="toggleCategory(${cat.id})">
            </h3>
            <div class="space-y-2">
              ${cat.filters.map((f: any) => `
                <div class="flex items-center justify-between p-2 bg-base-100 rounded">
                  <div>
                    <span class="font-bold">${f.name}</span>
                    <span class="badge badge-sm ${f.type === 'broad' ? 'badge-info' : 'badge-warning'}">${f.type}</span>
                    <p class="text-xs opacity-70">${JSON.parse(f.keywords).join(', ')}</p>
                  </div>
                  <div class="flex gap-2">
                    <input type="checkbox" class="toggle toggle-sm toggle-success" ${f.is_active ? 'checked' : ''}
                      onchange="toggleFilter(${f.id})">
                    <button class="btn btn-error btn-xs" onclick="deleteFilter(${f.id})">🗑️</button>
                  </div>
                </div>
              `).join('')}
            </div>
            <button class="btn btn-ghost btn-sm mt-2" onclick="showAddFilterModal(${cat.id})">
              + Adicionar Filtro
            </button>
          </div>
        </div>
      `).join('');
    }
  } catch (err) {
    console.error('Erro ao carregar filtros:', err);
  }
};

// Monitor
const loadMonitor = async (): Promise<void> => {
  try {
    const res = await fetch('/api/monitor/status', { credentials: 'include' });
    const data = await res.json();
    
    if (data.success) {
      const statusEl = document.getElementById('monitor-status')!;
      const btnEl = document.getElementById('monitor-toggle-btn')!;
      
      if (data.data.running) {
        statusEl.textContent = '🟢 Rodando';
        statusEl.className = 'badge badge-success';
        btnEl.textContent = '⏹️ Parar Monitor';
        btnEl.className = 'btn btn-error';
      } else {
        statusEl.textContent = '🔴 Parado';
        statusEl.className = 'badge badge-error';
        btnEl.textContent = '▶️ Iniciar Monitor';
        btnEl.className = 'btn btn-success';
      }
    }
  } catch (err) {
    console.error('Erro ao carregar monitor:', err);
  }
};

// Estatísticas
const loadStats = async (): Promise<void> => {
  try {
    const res = await fetch('/api/stats/overview', { credentials: 'include' });
    const data = await res.json();
    
    if (data.success) {
      document.getElementById('stats-today')!.textContent = data.data.today;
      document.getElementById('stats-week')!.textContent = data.data.week;
      document.getElementById('stats-month')!.textContent = data.data.month;
      document.getElementById('stats-channels')!.textContent = data.data.activeChannels;
      document.getElementById('stats-filters')!.textContent = data.data.activeFilters;
    }
  } catch (err) {
    console.error('Erro ao carregar estatísticas:', err);
  }
};

// Price Alerts
const loadPriceAlerts = async (): Promise<void> => {
  try {
    const res = await fetch('/api/price-alerts', { credentials: 'include' });
    const data = await res.json();
    
    if (data.success) {
      const tbody = document.getElementById('price-alerts-list')!;
      tbody.innerHTML = data.data.map((alert: any) => `
        <tr>
          <td>${alert.product_name}</td>
          <td>R$ ${alert.target_price.toFixed(2)}</td>
          <td>
            <button class="btn btn-error btn-xs" onclick="deletePriceAlert(${alert.id})">🗑️</button>
          </td>
        </tr>
      `).join('');
    }
  } catch (err) {
    console.error('Erro ao carregar alertas:', err);
  }
};

// Verifica autenticação
const checkAuth = async (): Promise<void> => {
  try {
    const res = await fetch('/api/auth/me', { credentials: 'include' });
    const data = await res.json();
    
    if (!data.success) {
      window.location.href = '/login';
      return;
    }
    
    currentUser = data.user;
    document.getElementById('user-name')!.textContent = currentUser.username;
  } catch (err) {
    window.location.href = '/login';
  }
};

// Logout
const logout = async (): Promise<void> => {
  try {
    await fetch('/api/auth/logout', { 
      method: 'POST',
      credentials: 'include'
    });
  } catch (err) {
    console.error('Erro no logout:', err);
  }
  window.location.href = '/login';
};

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  
  // Menu navigation
  document.querySelectorAll('.menu-item').forEach((item) => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const section = (e.currentTarget as HTMLElement).dataset.section!;
      navigate(section);
    });
  });
  
  // Inicializa no dashboard
  navigate('dashboard');
});

// Toggle Channel
(window as any).toggleChannel = async (id: number): Promise<void> => {
  await fetch(`/api/channels/${id}/toggle`, { 
    method: 'POST',
    credentials: 'include'
  });
  loadChannels();
};

// Delete Channel
(window as any).deleteChannel = async (id: number): Promise<void> => {
  if (!confirm('Remover este canal?')) return;
  await fetch(`/api/channels/${id}`, { 
    method: 'DELETE',
    credentials: 'include'
  });
  loadChannels();
};

// Toggle Filter
(window as any).toggleFilter = async (id: number): Promise<void> => {
  await fetch(`/api/filters/${id}/toggle`, { 
    method: 'POST',
    credentials: 'include'
  });
  loadFilters();
};

// Delete Filter
(window as any).deleteFilter = async (id: number): Promise<void> => {
  if (!confirm('Remover este filtro?')) return;
  await fetch(`/api/filters/${id}`, { 
    method: 'DELETE',
    credentials: 'include'
  });
  loadFilters();
};

// Toggle Category
(window as any).toggleCategory = async (id: number): Promise<void> => {
  await fetch(`/api/categories/${id}/toggle`, { 
    method: 'POST',
    credentials: 'include'
  });
  loadFilters();
};

// Toggle Monitor
(window as any).toggleMonitor = async (): Promise<void> => {
  const res = await fetch('/api/monitor/status', { credentials: 'include' });
  const data = await res.json();
  
  if (data.data.running) {
    await fetch('/api/monitor/stop', { 
      method: 'POST',
      credentials: 'include'
    });
  } else {
    await fetch('/api/monitor/start', { 
      method: 'POST',
      credentials: 'include'
    });
  }
  loadMonitor();
};

// Test Discord
(window as any).testDiscord = async (): Promise<void> => {
  const btn = document.getElementById('btn-test-discord')!;
  btn.textContent = 'Enviando...';
  btn.disabled = true;
  
  try {
    const res = await fetch('/api/discord/test', { 
      method: 'POST',
      credentials: 'include'
    });
    const data = await res.json();
    alert(data.message);
  } catch (err) {
    alert('Erro ao enviar teste');
  } finally {
    btn.textContent = '🧪 Testar Discord';
    btn.disabled = false;
  }
};

// Force verification
(window as any).forceCheck = async (): Promise<void> => {
  try {
    const res = await fetch('/api/monitor/force-check', {
      method: 'POST',
      credentials: 'include'
    });
    const data = await res.json();
    alert(data.message);
  } catch (err) {
    alert('Erro ao forçar verificação');
  }
};

// Add Channel
(window as any).addChannel = async (): Promise<void> => {
  const input = document.getElementById('new-channel') as HTMLInputElement;
  const username = input.value.trim();
  
  if (!username) return;
  
  try {
    await fetch('/api/channels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username })
    });
    input.value = '';
    loadChannels();
  } catch (err) {
    alert('Erro ao adicionar canal');
  }
};

// Save Telegram Config
(window as any).saveTelegramConfig = async (): Promise<void> => {
  const apiId = (document.getElementById('tg-api-id') as HTMLInputElement).value;
  const apiHash = (document.getElementById('tg-api-hash') as HTMLInputElement).value;
  const phone = (document.getElementById('tg-phone') as HTMLInputElement).value;
  
  try {
    const res = await fetch('/api/telegram-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ apiId, apiHash, phone })
    });
    const data = await res.json();
    alert(data.message);
    loadTelegramConfig();
  } catch (err) {
    alert('Erro ao salvar configuração');
  }
};

// Add Price Alert
(window as any).addPriceAlert = async (): Promise<void> => {
  const product = (document.getElementById('alert-product') as HTMLInputElement).value;
  const price = parseFloat((document.getElementById('alert-price') as HTMLInputElement).value);
  
  if (!product || !price) return;
  
  try {
    await fetch('/api/price-alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ productName: product, targetPrice: price })
    });
    
    (document.getElementById('alert-product') as HTMLInputElement).value = '';
    (document.getElementById('alert-price') as HTMLInputElement).value = '';
    loadPriceAlerts();
  } catch (err) {
    alert('Erro ao criar alerta');
  }
};

// Delete Price Alert
(window as any).deletePriceAlert = async (id: number): Promise<void> => {
  if (!confirm('Remover este alerta?')) return;
  await fetch(`/api/price-alerts/${id}`, { 
    method: 'DELETE',
    credentials: 'include'
  });
  loadPriceAlerts();
};

// Export Config
(window as any).exportConfig = (): void => {
  window.open('/api/backup/export', '_blank');
};
