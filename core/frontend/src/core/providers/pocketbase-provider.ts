/**
 * PocketBase Data Provider Implementation
 *
 * Implements the IDataProvider interface using PocketBase as the backend
 */

import PocketBase from 'pocketbase';
import type {
  IDataProvider,
  PaginatedResponse,
  QueryOptions,
  FilterOptions,
  SubscriptionCallback,
  UnsubscribeFn,
} from '../types/data-provider';

export class PocketBaseProvider implements IDataProvider {
  private pb: PocketBase;

  constructor(url?: string) {
    this.pb = new PocketBase(
      url || import.meta.env.VITE_POCKETBASE_URL || 'http://localhost:8090',
    );
    this.pb.autoCancellation(false);
  }

  /**
   * Get PocketBase instance (for advanced usage)
   */
  getInstance(): PocketBase {
    return this.pb;
  }

  async getOne<T = any>(collection: string, id: string): Promise<T> {
    return await this.pb.collection(collection).getOne<T>(id);
  }

  async getList<T = any>(
    collection: string,
    options?: QueryOptions,
  ): Promise<PaginatedResponse<T>> {
    const page = options?.page || 1;
    const perPage = options?.perPage || 50;

    const result = await this.pb
      .collection(collection)
      .getList<T>(page, perPage, {
        sort: options?.sort,
        filter: options?.filter,
      });

    return {
      items: result.items,
      page: result.page,
      perPage: result.perPage,
      totalItems: result.totalItems,
      totalPages: result.totalPages,
    };
  }

  async getAll<T = any>(
    collection: string,
    options?: FilterOptions,
  ): Promise<T[]> {
    const result = await this.pb.collection(collection).getFullList<T>({
      filter: options?.filter,
      sort: options?.sort,
    });
    return result;
  }

  async create<T = any>(collection: string, data: Partial<T>): Promise<T> {
    return await this.pb.collection(collection).create<T>(data);
  }

  async update<T = any>(
    collection: string,
    id: string,
    data: Partial<T>,
  ): Promise<T> {
    return await this.pb.collection(collection).update<T>(id, data);
  }

  async delete(collection: string, id: string): Promise<boolean> {
    await this.pb.collection(collection).delete(id);
    return true;
  }

  async subscribe<T = any>(
    collection: string,
    callback: SubscriptionCallback<T>,
  ): Promise<UnsubscribeFn> {
    await this.pb.collection(collection).subscribe<T>('*', (e: any) => {
      callback({
        action: e.action as 'create' | 'update' | 'delete',
        record: e.record,
      });
    });

    return () => {
      this.pb.collection(collection).unsubscribe('*');
    };
  }

  async customQuery<T = any>(
    method: string,
    params: Record<string, any>,
  ): Promise<T> {
    // PocketBase custom API calls
    return await this.pb.send(method, {
      method: params.method || 'GET',
      body: params.body,
      query: params.query,
    });
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.pb.health.check();
      return true;
    } catch {
      return false;
    }
  }
}
