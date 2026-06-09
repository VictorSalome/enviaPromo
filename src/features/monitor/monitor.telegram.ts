import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions/StringSession.js';

import { getConfig, updateSession } from '../telegram-config/telegram-config.repository.js';
import { findAll } from '../channel/channel.repository.js';
import { findAllFilters, getActiveFiltersCount, getTotalFiltersCount } from '../filter/filter.repository.js';
import { isDuplicate, addSentMessage } from '../dedup/dedup.repository.js';
import { sendMessage } from '../whatsapp/whatsapp.service.js';
import { getMonitorStatus, setRunningState } from './monitor.state.js';

let client: TelegramClient | null = null;
let isProcessing = false;
let consecutiveErrors = 0;
let lastMessageIds: Map<string, number> = new Map();

// Configurações inteligentes de retry (baseado na skill Telegram)
const RETRY_CONFIG = {
  maxRetries: 5,
  baseDelay: 5000,     // 5 segundos
  maxDelay: 300000,    // 5 minutos
  floodWaitMultiplier: 1.5
};

// Delay adaptativo baseado na atividade
let currentCheckInterval = 60000; // Começa com 1 minuto
const MIN_INTERVAL = 30000;  // 30 segundos mínimo
const MAX_INTERVAL = 120000; // 2 minutos máximo

export async function startTelegramMonitor(): Promise<void> {
  if (isProcessing) {
    console.log('[Monitor] Já está processando');
    return;
  }

  try {
    isProcessing = true;
    
    const tgConfig = await getConfig();
    if (!tgConfig || !tgConfig.apiId || !tgConfig.apiHash) {
      console.log('[Monitor] Configuração do Telegram não encontrada');
      scheduleNextCheck();
      return;
    }

    // Verificar se está conectado
    if (!tgConfig.isConnected || !tgConfig.sessionString) {
      console.log('[Monitor] Telegram não autenticado');
      scheduleNextCheck();
      return;
    }

    const channels = await findAll();
    const activeChannels = channels.filter(ch => {
      const isActive = (ch as any).is_active || (ch as any).isActive;
      return isActive === 1 || isActive === true;
    });
    
    if (activeChannels.length === 0) {
      console.log('[Monitor] Nenhum canal ativo');
      scheduleNextCheck();
      return;
    }

    // Verificar se há filtros ativos ou se deve pegar TUDO
    const activeFiltersCount = await getActiveFiltersCount();
    const totalFiltersCount = await getTotalFiltersCount();
    const noFilterMode = activeFiltersCount === 0 && totalFiltersCount > 0;

    if (!client) {
      await createClient(tgConfig);
    }

    if (!client || !client.connected) {
      console.log('[Monitor] Reconectando ao Telegram...');
      await client?.connect();
    }

    console.log(`[Monitor] Verificando ${activeChannels.length} canais (Modo: ${noFilterMode ? 'SEM FILTRO' : 'FILTRADO'})`);

    let messagesFound = 0;
    for (const channel of activeChannels) {
      const count = await processChannel(channel.username, noFilterMode);
      messagesFound += count;
    }

    // Ajustar intervalo dinamicamente (mais rápido se encontrou mensagens)
    if (messagesFound > 0) {
      currentCheckInterval = Math.max(MIN_INTERVAL, currentCheckInterval * 0.8);
      consecutiveErrors = 0;
    } else {
      currentCheckInterval = Math.min(MAX_INTERVAL, currentCheckInterval * 1.1);
    }

    console.log(`[Monitor] Próxima verificação em ${(currentCheckInterval/1000).toFixed(0)}s`);

  } catch (err: any) {
    console.error('[Monitor] Erro:', err);
    consecutiveErrors++;
    
    // Tratamento inteligente de FloodWait (baseado na skill Telegram)
    if (err.code === 420 || err.errorMessage?.includes('FLOOD')) {
      const waitTime = err.seconds || 60;
      console.log(`[Monitor] FloodWait detectado. Aguardando ${waitTime}s...`);
      currentCheckInterval = Math.max(waitTime * 1000, 120000);
    } else if (consecutiveErrors >= 3) {
      console.log('[Monitor] Muitos erros consecutivos. Reconectando...');
      await reconnectClient();
      consecutiveErrors = 0;
    }
  } finally {
    isProcessing = false;
    scheduleNextCheck();
  }
}

async function createClient(tgConfig: any): Promise<void> {
  const session = new StringSession(tgConfig.sessionString || '');
  client = new TelegramClient(
    session,
    parseInt(tgConfig.apiId),
    tgConfig.apiHash,
    { 
      connectionRetries: RETRY_CONFIG.maxRetries,
      useWSS: false,
      timeout: 30000
    }
  );
  await client.connect();
  
  const sessionString = session.save();
  await updateSession(sessionString, true);
}

async function reconnectClient(): Promise<void> {
  if (client) {
    try {
      await client.disconnect();
    } catch (e) {}
    client = null;
  }
  
  const tgConfig = await getConfig();
  if (tgConfig) {
    await createClient(tgConfig);
  }
}

function scheduleNextCheck(): void {
  if (getMonitorStatus().running) {
    setTimeout(() => {
      startTelegramMonitor();
    }, currentCheckInterval);
  }
}

async function processChannel(channelUsername: string, noFilterMode: boolean): Promise<number> {
  try {
    if (!client) return 0;

    const entity = await client.getEntity(channelUsername);
    
    // Buscar apenas mensagens novas (mais eficiente)
    const lastId = lastMessageIds.get(channelUsername) || 0;
    const messages = await client.getMessages(entity, { 
      limit: noFilterMode ? 5 : 10,
      minId: lastId > 0 ? lastId : undefined
    });
    
    if (messages.length === 0) return 0;
    
    // Atualizar último ID
    const newLastId = Math.max(...messages.map(m => m.id || 0));
    if (newLastId > lastId) {
      lastMessageIds.set(channelUsername, newLastId);
    }

    let sentCount = 0;
    const filters = noFilterMode ? [] : await findAllFilters();
    
    for (const message of messages.reverse()) { // Processar do mais antigo para o mais novo
      const result = await processMessage(message, channelUsername, filters, noFilterMode);
      if (result) sentCount++;
    }
    
    return sentCount;
  } catch (err) {
    console.error('[Monitor] Erro ao processar canal', channelUsername, ':', err);
    return 0;
  }
}

async function processMessage(
  message: any, 
  channelUsername: string, 
  filters: any[], 
  noFilterMode: boolean
): Promise<boolean> {
  try {
    // Suportar texto e mídia com legenda
    let text = '';
    
    if (message.text) {
      text = message.text;
    } else if (message.caption) {
      text = message.caption;
    }
    
    if (!text || text.trim().length === 0) {
      return false; // Ignorar mensagens sem texto
    }
    
    const textLower = text.toLowerCase();
    
    // Modo SEM FILTRO: enviar TUDO
    if (noFilterMode) {
      return await sendPromoMessage(text, channelUsername, null, 'Todas as Promoções');
    }
    
    // Modo COM FILTROS
    for (const filter of filters) {
      if (!filter.is_active) continue;
      
      const keywords = filter.keywords.toLowerCase().split(',').map((k: string) => k.trim());
      const matches = filter.type === 'specific' 
        ? keywords.every((k: string) => textLower.includes(k))
        : keywords.some((k: string) => textLower.includes(k));
      
      if (matches) {
        const sent = await sendPromoMessage(text, channelUsername, message.id, filter.name);
        if (sent) return true;
      }
    }
    
    return false;
  } catch (err) {
    console.error('[Monitor] Erro ao processar mensagem:', err);
    return false;
  }
}

async function sendPromoMessage(
  text: string, 
  channelUsername: string, 
  messageId: number | null,
  filterName: string
): Promise<boolean> {
  try {
    // Extrair informações com IA (mais inteligente)
    const product = extractProductName(text);
    const price = extractPrice(text);
    const store = extractStore(text, channelUsername);
    const discount = extractDiscount(text);
    const originalPrice = extractOriginalPrice(text);
    
    const link = messageId 
      ? `https://t.me/${channelUsername.replace('@', '')}/${messageId}`
      : `https://t.me/${channelUsername.replace('@', '')}`;
    
    // Verificar duplicata com janela maior (24 horas)
    const dup = await isDuplicate(link, product, price || undefined, 1440);
    if (dup) {
      console.log('[Monitor] Duplicata ignorada:', product);
      return false;
    }
    
    // Criar mensagem inteligente (baseado no whatsapp-automation skill)
    const messageText = formatSmartMessage(product, price, originalPrice, discount, store, link, filterName);
    
    await sendMessage(messageText);
    
    await addSentMessage({
      link,
      product,
      price: price ?? undefined,
      store,
      channel: channelUsername,
      messageText: text.substring(0, 1000),
      matchedFilters: [filterName]
    });
    
    console.log('[Monitor] Promoção enviada:', product);
    return true;
    
  } catch (err) {
    console.error('[Monitor] Erro ao enviar mensagem:', err);
    return false;
  }
}

// ========== EXTRACTORES INTELIGENTES ==========

function extractProductName(text: string): string {
  // Limpar o texto
  const lines = text.split('\n').filter(l => l.trim().length > 0);
  
  // Procurar linha que parece um produto (não preço, não link)
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length > 5 && 
        !trimmed.match(/^R?\$?\s*\d/) && 
        !trimmed.startsWith('http') &&
        !trimmed.match(/^(promo|oferta|desconto|link|preço)/i)) {
      return trimmed.substring(0, 80);
    }
  }
  
  return lines[0]?.substring(0, 80) || 'Produto';
}

function extractPrice(text: string): number | null {
  // Padrões de preço brasileiros
  const patterns = [
    /(?:por|apenas|custando|preço|R\$)\s*[:\-]?\s*(?:R\$\s*)?(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})/i,
    /(?:R\$\s*)(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})/,
    /(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})\s*(?:reais|r\$)/i,
    /(?:\b|\s)(\d+[.,]\d{2})(?=\s*(?:reais|r\$|\b))/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const priceStr = match[1].replace(/\./g, '').replace(',', '.');
      const price = parseFloat(priceStr);
      if (price > 0 && price < 100000) return price;
    }
  }
  
  return null;
}

function extractOriginalPrice(text: string): number | null {
  // Procurar preço original (geralmente com   // Procurar padrões como "de R$ X por R$ Y" ou "era R$ X agora R$ Y"
  const patterns = [
    /(?:de|era|era\s*de|por)\s*[:\-]?\s*(?:R\$\s*)?(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})/i,
    /(?:preço\s*original|antigo|de\s*antes)\s*[:\-]?\s*(?:R\$\s*)?(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const priceStr = match[1].replace(/\./g, '').replace(',', '.');
      const price = parseFloat(priceStr);
      if (price > 0 && price < 100000) return price;
    }
  }
  
  return null;
}

function extractDiscount(text: string): string | null {
  // Procurar porcentagem de desconto
  const discountMatch = text.match(/(\d+)%\s*(?:off|desconto|de\s*desconto)/i);
  if (discountMatch) {
    return discountMatch[1] + '% OFF';
  }
  
  // Procurar "economize R$ X"
  const saveMatch = text.match(/(?:economize|economia)\s*(?:R\$\s*)?(\d+[.,]?\d*)/i);
  if (saveMatch) {
    return 'Economize R$ ' + saveMatch[1];
  }
  
  return null;
}

function extractStore(text: string, channel: string): string {
  // Extrair nome da loja do texto
  const storePatterns = [
    /(?:loja|store|site|vendedor|shop)[\s:]+([^\n]+)/i,
    /(?:comprar\s*(?:em|no|na))\s+([^\n]+)/i,
    /(?:amazon|mercado\s+livre|magazine\s*luiza|shopee|aliexpress|americanas|submarino)/i
  ];
  
  for (const pattern of storePatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1]?.trim() || match[0]?.trim() || channel;
    }
  }
  
  return channel;
}

// ========== FORMATADORES DE MENSAGEM ==========

function formatSmartMessage(
  product: string, 
  price: number | null, 
  originalPrice: number | null,
  discount: string | null,
  store: string, 
  link: string, 
  filterName: string,
): string {
  const priceStr = price ? `R$ ${price.toFixed(2)}` : 'Preço não informado';
  
  let message = `🎯 *PROMOÇÃO ENCONTRADA*\n\n`;
  message += `📦 *Produto:* ${product}\n`;
  
  if (originalPrice && price && originalPrice > price) {
    const savings = originalPrice - price;
    const percent = ((savings / originalPrice) * 100).toFixed(0);
    message += `💰 *Preço:* ${priceStr}\n`;
    message += `📉 *De:* R$ ${originalPrice.toFixed(2)}\n`;
    message += `💵 *Economia:* R$ ${savings.toFixed(2)} (${percent}%)\n`;
  } else {
    message += `💰 *Preço:* ${priceStr}\n`;
  }
  
  if (discount) {
    message += `🏷️ *Desconto:* ${discount}\n`;
  }
  
  message += `🏪 *Loja:* ${store}\n`;
  message += `📂 *Categoria:* ${filterName}\n\n`;
  message += `🔗 *Link:* ${link}`;
  
  return message;
}

export async function stopTelegramMonitor(): Promise<void> {
  if (client) {
    try {
      await client.disconnect();
    } catch (e) {}
    client = null;
  }
  lastMessageIds.clear();
  setRunningState(false);
  console.log('[Monitor] Monitor parado');
}
