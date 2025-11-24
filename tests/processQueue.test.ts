// Mock stores and native modules before importing the module under test
import AsyncStorage from '@react-native-async-storage/async-storage';
import { enqueueRequest, getQueue, processQueue } from '../lib/offlineQueue';

const mockReqStore = {
  state: { byId: {}, listsByStatus: {} },
  getState() {
    return this.state;
  },
  setState(newState: any) {
    this.state = newState;
  }
};

jest.mock('@/stores/requestsStore', () => ({ useRequestsStore: mockReqStore }));
jest.mock('@/stores/farmerStore', () => ({ useFarmerStore: { getState: () => ({ farms: [] }), setState: jest.fn() } }));

// Provide a fetch mock and ensure AsyncStorage is available (jest.setup provides general mocks)
beforeEach(() => {
  // reset fetch mock
  // @ts-ignore
  global.fetch = jest.fn();
});

afterEach(() => {
  // @ts-ignore
  global.fetch = undefined;
});

describe('processQueue mapping and send', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    // reset mock store
    mockReqStore.state = { byId: {}, listsByStatus: {} };
  });

  test('processQueue sends queued request and maps server response into requestsStore', async () => {
    // arrange: enqueue a request
    const id = await enqueueRequest('POST', '/requests', { title: 'local' });

    // create a placeholder in the mocked requests store that references the queued id
    mockReqStore.state.byId = {
      local_placeholder: { _queuedId: id, title: 'local', status: 'pending' }
    };

    // mock fetch to return success and a body containing the created request
    // @ts-ignore
    global.fetch.mockResolvedValue({ ok: true, status: 201, json: async () => ({ request: { id: 'server-req-1', title: 'from-server', status: 'pending' } }) });

    // act
    await processQueue();

    // assert: placeholder removed and server item added
    const state = mockReqStore.getState();
    const byId: any = state.byId;
    expect(Object.keys(byId)).toContain('server-req-1');
    expect(byId['server-req-1'].title).toBe('from-server');
    expect(byId['local_placeholder']).toBeUndefined();

    // queue should be empty
    const q = await getQueue();
    expect(q.length).toBe(0);
  });
});
