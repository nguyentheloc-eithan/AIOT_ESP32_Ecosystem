import PocketBase from 'pocketbase';

// Initialize PocketBase client
const pb = new PocketBase(
  import.meta.env.VITE_POCKETBASE_URL || 'http://localhost:8090',
);

// Enable auto cancellation for duplicate requests
pb.autoCancellation(false);

export default pb;

// Types for our collections
export interface Task {
  id: string;
  device_id: string;
  name: string;
  type: string;
  status: 'pending' | 'processing' | 'done' | 'failed';
  payload: Record<string, any>;
  scheduled_at: string;
  started_at?: string;
  completed_at?: string;
  created: string;
  updated: string;
}

export interface Device {
  id: string;
  name: string;
  type: string;
  status: 'online' | 'offline';
  created: string;
  updated: string;
}
