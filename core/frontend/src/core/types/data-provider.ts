/**
 * Data Provider Interface
 *
 * This abstraction allows plugins to work with any backend
 * by communicating through a unified interface
 */

/**
 * Pagination options
 */
export interface PaginationOptions {
  page?: number;
  perPage?: number;
  sort?: string;
}

/**
 * Filter options
 */
export interface FilterOptions {
  filter?: string;
  [key: string]: any;
}

/**
 * Query options combining pagination and filtering
 */
export interface QueryOptions extends PaginationOptions, FilterOptions {}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
}

/**
 * Subscription callback
 */
export type SubscriptionCallback<T> = (event: {
  action: 'create' | 'update' | 'delete';
  record: T;
}) => void;

/**
 * Unsubscribe function
 */
export type UnsubscribeFn = () => void;

/**
 * Main data provider interface
 *
 * Implementations can use PocketBase, REST API, GraphQL, gRPC, etc.
 */
export interface IDataProvider {
  /**
   * Get a single record by ID
   */
  getOne<T = any>(collection: string, id: string): Promise<T>;

  /**
   * Get a list of records with optional pagination and filtering
   */
  getList<T = any>(
    collection: string,
    options?: QueryOptions,
  ): Promise<PaginatedResponse<T>>;

  /**
   * Get all records (use with caution)
   */
  getAll<T = any>(collection: string, options?: FilterOptions): Promise<T[]>;

  /**
   * Create a new record
   */
  create<T = any>(collection: string, data: Partial<T>): Promise<T>;

  /**
   * Update an existing record
   */
  update<T = any>(collection: string, id: string, data: Partial<T>): Promise<T>;

  /**
   * Delete a record
   */
  delete(collection: string, id: string): Promise<boolean>;

  /**
   * Subscribe to real-time updates (if supported)
   */
  subscribe?<T = any>(
    collection: string,
    callback: SubscriptionCallback<T>,
  ): Promise<UnsubscribeFn>;

  /**
   * Custom query (for provider-specific operations)
   */
  customQuery?<T = any>(
    method: string,
    params: Record<string, any>,
  ): Promise<T>;

  /**
   * Health check
   */
  healthCheck?(): Promise<boolean>;
}
