export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface TelegramConfig {
  id?: number;
  apiId: string;
  apiHash: string;
  phone?: string;
  sessionString?: string;
  isConnected: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Channel {
  id?: number;
  username: string;
  name?: string;
  isActive: boolean;
  createdAt?: string;
}

export interface Category {
  id?: number;
  name: string;
  color: string;
  icon: string;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
}

export interface Filter {
  id?: number;
  categoryId: number;
  name: string;
  type: 'broad' | 'specific';
  keywords: string[];
  isActive: boolean;
  matchCount: number;
  createdAt?: string;
}

export interface SentMessage {
  id?: number;
  link?: string;
  product?: string;
  price?: number;
  store?: string;
  channel: string;
  messageText: string;
  matchedFilters: string[];
  sentAt: string;
}

export interface PriceAlert {
  id?: number;
  productName: string;
  targetPrice: number;
  isActive: boolean;
  createdAt?: string;
}

export interface Log {
  id?: number;
  level: 'info' | 'warn' | 'error';
  message: string;
  feature?: string;
  data?: string;
  createdAt: string;
}

export interface SystemStats {
  totalMessagesToday: number;
  totalMessagesWeek: number;
  totalMessagesMonth: number;
  activeChannels: number;
  activeFilters: number;
  uptime: string;
  lastMessage?: string;
}
