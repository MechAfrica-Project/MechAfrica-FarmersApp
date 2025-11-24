import AsyncStorage from '@react-native-async-storage/async-storage';

const mockReqStore = {
  state: { byId: {}, listsByStatus: {} },
  getState() {
    return this.state;
  },
  setState(newState: any) {
    this.state = newState;
  }
};

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
    jest.resetModules();
  });

  test('processQueue sends queued request and maps server response into requestsStore', async () => {
    // mock the stores before importing the queue module
    jest.doMock('@/stores/requestsStore', () => ({ useRequestsStore: mockReqStore }));
    jest.doMock('@/stores/farmerStore', () => ({ useFarmerStore: { getState: () => ({ farms: [] }), setState: jest.fn() } }));

    const { enqueueRequest, processQueue, getQueue } = require('../lib/offlineQueue');

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
