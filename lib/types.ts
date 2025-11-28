// lib/types.ts
// Shared simple API types used by lib/api.ts and stores

export type User = {
  id: string;
  name?: string;
  phone?: string;
  email?: string;
  avatar?: string;
};

export type UploadResult = {
  url?: string;
  key?: string;
  bucket?: string;
  metadata?: Record<string, any>;
  [k: string]: any;
};

export type ApiQueuedResponse = {
  queued: true;
  queuedId: string | number;
};

export default {} as const;
