 # Testing & Offline Resilience Overview
 
 This note captures how automated tests are organized in `mechafrica-farmers-app` and how the offline/network-resilience stack works across the API layer, background queue, and UI.
 
 ---
 
 ## 1. Testing Implementation
 
 ### Toolchain & Configuration
 - Jest with `ts-jest` (`jest.config.cjs`) compiles TypeScript directly, using Node as the test environment. The default runner includes every `tests/**/*.test.ts`.
 - A second config (`jest.integration.config.cjs`) isolates slower integration specs such as `tests/integration/ping.integration.test.ts`.
 - `tests/jest.setup.ts` runs after each test file to:
   - Increase Jest's default timeout.
   - Reset the module registry so Zustand stores and singletons do not leak state.
   - Mock native modules (`expo-secure-store`, `expo-router`, `@react-native-async-storage/async-storage`) with deterministic in-memory implementations.
 
 Run everything with `npm test`; integration-only checks use `npm run test:integration`.
 
 ### Unit & Store Tests
 | File | Focus |
 | --- | --- |
 | `tests/api.test.ts` | Verifies `lib/api.ts` retries and offline enqueue logic: mock `useUIStore` to force offline mode, ensure write calls return `{ queued: true }`, and assert that HTTP errors raise `ApiError` with parsed bodies. |
 | `tests/authStore.test.ts` | Ensures `useAuthStore.verifyOtp` persists tokens to SecureStore, calls `setAuthToken`, and avoids background fetches by stubbing dependent stores. |
 | `tests/notificationStore.test.ts` | Confirms the store accepts both `{ notifications: [] }` and raw arrays, proving flexible payload handling. |
 | `tests/offlineQueue.test.ts` | Covers queue primitives (`enqueueRequest`, `getQueue`, `removeFromQueue`, `clearQueue`) using the AsyncStorage mock to guarantee isolation. |
 | `tests/offlineQueue.retry.test.ts` | Exercises `retryQueueItem`: seeds the queue via `_test_setQueue`, forces a network failure on the first `fetch`, then validates requeueing/backoff and eventual success. |
 | `tests/processQueue.test.ts` | Uses module mocks for `useRequestsStore` and `useFarmerStore` to assert that `processQueue` removes local placeholders (keyed by `_queuedId`) and inserts the server-created entities. |
 
 `tests/stores.test.ts` remains as a skipped placeholder so legacy CI jobs expecting that filename continue to pass.
 
 ### Integration Test
 `tests/integration/ping.integration.test.ts` performs a real HTTP call to `EXPO_PUBLIC_API_URL` (if defined) and expects a `2xx` response on `PING_PATH` (default `/health`). Run via `npm run test:integration`.
 
 ---
 
 ## 2. Offline & Network Features
 
 ### Connectivity Tracking
 - `lib/network.ts` lazily imports `@react-native-community/netinfo`; if unavailable, it falls back to `expo-network`.
 - Every connectivity change updates `useUIStore.online` and, when a connection is restored, triggers `processQueue()` via a dynamic import. The monitor starts in `app/_layout.tsx` and is unsubscribed on unmount.
 
 ### API Wrapper Behavior
 - `lib/api.ts` wraps `fetch`, injecting the auth token, headers, and toast-based error messaging.
 - Before issuing a network write (`POST`, `PUT`, `DELETE`), it calls `enqueueIfOffline`. When `useUIStore.online === false`, the payload is stored through `lib/offlineQueue.enqueueRequest` and the caller receives `{ queued: true, queuedId }`, allowing UI stores to create local placeholders.
 
 ### Persistent Offline Queue
 - `lib/offlineQueue.ts` keeps serialized work items in AsyncStorage (`offlineRequestQueue:v1`) and uses Expo SecureStore to fetch the saved JWT before replaying work.
 - `processQueue()`:
   - Guards against concurrent runs with a `processing` flag.
   - Replays requests with exponential backoff and jitter, dropping client errors (4xx) and hard-failing after 5 attempts.
   - Special-cases uploads by rebuilding `FormData`.
   - Maps successful responses back into local state:
     - Requests: replaces `_queuedId` placeholders inside `useRequestsStore.byId`.
     - Farms: swaps `_queuedId` entries in `useFarmerStore.farms`.
 - Helpers such as `retryQueueItem`, `removeFromQueue`, and `_test_setQueue` support manual retries, UI management, and deterministic testing.
 
 ### UI Surfaces
 - `app/components/general/OfflineQueueIndicator.tsx` polls `getQueue()` every 3 seconds and displays a banner (mounted globally in `app/_layout.tsx`) indicating offline/queued counts.
 - `app/queued.tsx` provides a management screen offering retry-all (calls `processQueue()`), per-item retry (`retryQueueItem`), and destructive actions (`removeFromQueue`, `clearQueue`), with toast feedback.
 - Stores create user-visible placeholders while offline:
   - `useRequestsStore.addRequest()` inserts a local pending item flagged with `_queuedId` and surfaces a `toastQueued` notification.
   - `useFarmerStore.addFarm()` mirrors the same pattern for farms.
   - When `processQueue()` eventually succeeds, the mapping logic replaces these placeholders with canonical server records.
 
 ### Error Feedback
 - `lib/toast` integrations ensure every offline enqueue, retry outcome, and API failure provides immediate user feedback (success/info/error). Because the queue indicator and `queued` screen are global, farmers can monitor progress without leaving their workflows.
 
 ---
 
 ## 3. Extending or Testing the System
 
 - When adding new write APIs, call `apiFetch` (instead of raw `fetch`) so offline enqueueing and toasts remain consistent. If the endpoint creates placeholder entities locally, store `_queuedId` to benefit from automatic reconciliation.
 - To cover new behaviors, colocate Jest files under `tests/` and prefer module mocks (`jest.doMock`) so the production modules stay untouched. Use `_test_setQueue` for deterministic queue state in unit tests.
 - For end-to-end validation of offline flows, simulate `useUIStore.online = false`, invoke the store action (e.g., `addFarm`), confirm placeholder creation, then call `processQueue()` with a mocked `fetch` response to assert reconciliation.
 