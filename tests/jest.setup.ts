// Basic Jest setup for tests. Use manual mocks under tests/__mocks__.
jest.setTimeout(10000);

// Clear module registry between tests to avoid state leakage.
afterEach(() => {
  jest.resetModules();
});

// Mock native/Expo modules that aren't available in the Node test environment.
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async (k: string) => null),
  setItemAsync: jest.fn(async (k: string, v: string) => null),
  deleteItemAsync: jest.fn(async (k: string) => null)
}));

// Mock expo-router to avoid importing ESM/JSX from node_modules in Jest.
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    getState: jest.fn(),
    getRootState: jest.fn(),
    getInitialState: jest.fn(),
  },
}));

// In-memory AsyncStorage mock used by tests
const __asyncStorageMock: Record<string, string> = {};
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async (k: string) => (__asyncStorageMock.hasOwnProperty(k) ? __asyncStorageMock[k] : null)),
  setItem: jest.fn(async (k: string, v: string) => { __asyncStorageMock[k] = v; return null; }),
  removeItem: jest.fn(async (k: string) => { delete __asyncStorageMock[k]; return null; }),
  clear: jest.fn(async () => { for (const k of Object.keys(__asyncStorageMock)) delete __asyncStorageMock[k]; return null; }),
  __INTERNAL__storage: __asyncStorageMock
}));

