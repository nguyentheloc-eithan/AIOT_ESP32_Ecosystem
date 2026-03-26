/**
 * REST API Data Provider Implementation
 *
 * Implements the IDataProvider interface using standard REST API
 */

import type {
  IDataProvider,
  PaginatedResponse,
  QueryOptions,
  FilterOptions,
  SubscriptionCallback,
  UnsubscribeFn,
} from '../types/data-provider';

export interface RestProviderConfig {
  baseUrl: string;
  headers?: Record<string, string>;
  credentials?: RequestCredentials;
}

export class RestApiProvider implements IDataProvider {
  private config: RestProviderConfig;

  constructor(config: RestProviderConfig) {
    this.config = {
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
      credentials: config.credentials || 'same-origin',
      ...config,
    };
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit,
  ): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.config.headers,
        ...options?.headers,
      },
      credentials: this.config.credentials,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

  async getOne<T = any>(collection: string, id: string): Promise<T> {
    return await this.request<T>(`/${collection}/${id}`);
  }

  async getList<T = any>(
    collection: string,
    options?: QueryOptions,
  ): Promise<PaginatedResponse<T>> {
    const params = new URLSearchParams();

    if (options?.page) params.append('page', options.page.toString());
    if (options?.perPage) params.append('perPage', options.perPage.toString());
    if (options?.sort) params.append('sort', options.sort);
    if (options?.filter) params.append('filter', options.filter);

    const queryString = params.toString();
    const endpoint = `/${collection}${queryString ? `?${queryString}` : ''}`;

    return await this.request<PaginatedResponse<T>>(endpoint);
  }

  async getAll<T = any>(
    collection: string,
    options?: FilterOptions,
  ): Promise<T[]> {
    const params = new URLSearchParams();
    if (options?.filter) params.append('filter', options.filter);
    if (options?.sort) params.append('sort', options.sort);

    const queryString = params.toString();
    const endpoint = `/${collection}/all${queryString ? `?${queryString}` : ''}`;

    return await this.request<T[]>(endpoint);
  }

  async create<T = any>(collection: string, data: Partial<T>): Promise<T> {
    return await this.request<T>(`/${collection}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async update<T = any>(
    collection: string,
    id: string,
    data: Partial<T>,
  ): Promise<T> {
    return await this.request<T>(`/${collection}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(collection: string, id: string): Promise<boolean> {
    await this.request(`/${collection}/${id}`, {
      method: 'DELETE',
    });
    return true;
  }

  // REST doesn't natively support subscriptions, but can use WebSocket or SSE
  async subscribe<T = any>(
    _collection: string,
    _callback: SubscriptionCallback<T>,
  ): Promise<UnsubscribeFn> {
    console.warn('Real-time subscriptions not implemented for REST provider');
    return () => {
      // No-op
    };
  }

  async customQuery<T = any>(
    method: string,
    params: Record<string, any>,
  ): Promise<T> {
    return await this.request<T>(method, {
      method: params.method || 'GET',
      body: params.body ? JSON.stringify(params.body) : undefined,
    });
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.request('/health');
      return true;
    } catch {
      return false;
    }
  }
}
