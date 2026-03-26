# Creating a Custom Data Provider

This guide shows you how to create a custom data provider for any backend service.

## Quick Example: GraphQL Provider

```typescript
// src/core/providers/graphql-provider.ts
import {
  IDataProvider,
  PaginatedResponse,
  QueryOptions,
  FilterOptions,
} from '../types/data-provider';

export class GraphQLProvider implements IDataProvider {
  private endpoint: string;
  private headers: Record<string, string>;

  constructor(endpoint: string, headers?: Record<string, string>) {
    this.endpoint = endpoint;
    this.headers = headers || {};
  }

  private async query<T>(query: string, variables?: any): Promise<T> {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.headers,
      },
      body: JSON.stringify({ query, variables }),
    });

    const { data, errors } = await response.json();
    if (errors) throw new Error(errors[0].message);
    return data;
  }

  async getOne<T = any>(collection: string, id: string): Promise<T> {
    const query = `
      query Get${collection}($id: ID!) {
        ${collection}(id: $id) {
          id
          # Add your fields
        }
      }
    `;
    const data = await this.query<any>(query, { id });
    return data[collection];
  }

  async getList<T = any>(
    collection: string,
    options?: QueryOptions,
  ): Promise<PaginatedResponse<T>> {
    const query = `
      query List${collection}($page: Int, $perPage: Int) {
        ${collection}s(page: $page, perPage: $perPage) {
          items {
            id
            # Add your fields
          }
          totalItems
          totalPages
        }
      }
    `;
    const data = await this.query<any>(query, {
      page: options?.page || 1,
      perPage: options?.perPage || 50,
    });

    return {
      items: data[`${collection}s`].items,
      page: options?.page || 1,
      perPage: options?.perPage || 50,
      totalItems: data[`${collection}s`].totalItems,
      totalPages: data[`${collection}s`].totalPages,
    };
  }

  async getAll<T = any>(collection: string): Promise<T[]> {
    const query = `
      query All${collection} {
        ${collection}s {
          id
          # Add your fields
        }
      }
    `;
    const data = await this.query<any>(query);
    return data[`${collection}s`];
  }

  async create<T = any>(collection: string, data: Partial<T>): Promise<T> {
    const mutation = `
      mutation Create${collection}($input: ${collection}Input!) {
        create${collection}(input: $input) {
          id
          # Add your fields
        }
      }
    `;
    const result = await this.query<any>(mutation, { input: data });
    return result[`create${collection}`];
  }

  async update<T = any>(
    collection: string,
    id: string,
    data: Partial<T>,
  ): Promise<T> {
    const mutation = `
      mutation Update${collection}($id: ID!, $input: ${collection}Input!) {
        update${collection}(id: $id, input: $input) {
          id
          # Add your fields
        }
      }
    `;
    const result = await this.query<any>(mutation, { id, input: data });
    return result[`update${collection}`];
  }

  async delete(collection: string, id: string): Promise<boolean> {
    const mutation = `
      mutation Delete${collection}($id: ID!) {
        delete${collection}(id: $id)
      }
    `;
    await this.query<any>(mutation, { id });
    return true;
  }

  // GraphQL subscriptions for real-time updates
  async subscribe<T = any>(
    collection: string,
    callback: (event: any) => void,
  ): Promise<() => void> {
    // Implement WebSocket subscription
    // This is a simplified example
    const ws = new WebSocket(this.endpoint.replace('http', 'ws'));

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: 'subscribe',
          payload: {
            query: `
            subscription On${collection}Changed {
              ${collection}Changed {
                action
                record {
                  id
                  # Add your fields
                }
              }
            }
          `,
          },
        }),
      );
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      callback(data);
    };

    return () => {
      ws.close();
    };
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.query('query { __typename }');
      return true;
    } catch {
      return false;
    }
  }
}
```

## Using Your Custom Provider

```typescript
// src/App.tsx
import { GraphQLProvider } from './core/providers/graphql-provider';

function App() {
  const [dataProvider] = useState<IDataProvider>(
    () =>
      new GraphQLProvider('https://api.example.com/graphql', {
        Authorization: 'Bearer your-token',
      }),
  );

  // Rest of your app...
}
```

## Provider Requirements

A data provider must implement the `IDataProvider` interface:

### Required Methods

- `getOne<T>(collection: string, id: string): Promise<T>`
- `getList<T>(collection: string, options?: QueryOptions): Promise<PaginatedResponse<T>>`
- `getAll<T>(collection: string, options?: FilterOptions): Promise<T[]>`
- `create<T>(collection: string, data: Partial<T>): Promise<T>`
- `update<T>(collection: string, id: string, data: Partial<T>): Promise<T>`
- `delete(collection: string, id: string): Promise<boolean>`

### Optional Methods

- `subscribe?<T>(collection: string, callback: SubscriptionCallback<T>): Promise<UnsubscribeFn>`
- `customQuery?<T>(method: string, params: Record<string, any>): Promise<T>`
- `healthCheck?(): Promise<boolean>`

## Example: Firebase Provider

```typescript
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import {
  IDataProvider,
  PaginatedResponse,
  QueryOptions,
} from '../types/data-provider';

export class FirebaseProvider implements IDataProvider {
  private db: any;

  constructor(firebaseApp: any) {
    this.db = getFirestore(firebaseApp);
  }

  async getOne<T>(collection: string, id: string): Promise<T> {
    const docRef = doc(this.db, collection, id);
    const docSnap = await getDoc(docRef);
    return { id: docSnap.id, ...docSnap.data() } as T;
  }

  async getList<T>(
    collection: string,
    options?: QueryOptions,
  ): Promise<PaginatedResponse<T>> {
    const collectionRef = collection(this.db, collection);
    const querySnapshot = await getDocs(collectionRef);
    const items = querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as T,
    );

    return {
      items,
      page: 1,
      perPage: items.length,
      totalItems: items.length,
      totalPages: 1,
    };
  }

  async getAll<T>(collection: string): Promise<T[]> {
    const result = await this.getList<T>(collection);
    return result.items;
  }

  async create<T>(collectionName: string, data: Partial<T>): Promise<T> {
    const collectionRef = collection(this.db, collectionName);
    const docRef = await addDoc(collectionRef, data);
    return { id: docRef.id, ...data } as T;
  }

  async update<T>(
    collectionName: string,
    id: string,
    data: Partial<T>,
  ): Promise<T> {
    const docRef = doc(this.db, collectionName, id);
    await updateDoc(docRef, data);
    return { id, ...data } as T;
  }

  async delete(collectionName: string, id: string): Promise<boolean> {
    const docRef = doc(this.db, collectionName, id);
    await deleteDoc(docRef);
    return true;
  }
}
```

## Testing Your Provider

```typescript
import { describe, it, expect } from 'vitest';
import { MyCustomProvider } from './my-custom-provider';

describe('MyCustomProvider', () => {
  const provider = new MyCustomProvider(/* config */);

  it('should get a single record', async () => {
    const record = await provider.getOne('tasks', '123');
    expect(record).toHaveProperty('id', '123');
  });

  it('should get a list of records', async () => {
    const result = await provider.getList('tasks', { page: 1, perPage: 10 });
    expect(result.items).toBeInstanceOf(Array);
    expect(result.totalItems).toBeGreaterThan(0);
  });

  it('should create a record', async () => {
    const newRecord = await provider.create('tasks', { name: 'Test Task' });
    expect(newRecord).toHaveProperty('id');
    expect(newRecord).toHaveProperty('name', 'Test Task');
  });
});
```

## Tips

1. **Error Handling**: Always wrap API calls in try-catch blocks
2. **Type Safety**: Use TypeScript generics for type inference
3. **Caching**: Consider implementing a cache layer for better performance
4. **Retries**: Add retry logic for failed requests
5. **Logging**: Add logging for debugging
6. **Authentication**: Handle token refresh and authentication errors
7. **Offline Support**: Consider offline capabilities for better UX

## Built-in Providers

The plugin system includes these providers out of the box:

- **PocketBaseProvider**: For PocketBase backend
- **RestApiProvider**: For standard REST APIs

You can use these as references for building your own provider.
