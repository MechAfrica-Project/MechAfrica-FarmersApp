const storage: Record<string, string> = {};

export default {
  async getItem(key: string) {
    return storage.hasOwnProperty(key) ? storage[key] : null;
  },
  async setItem(key: string, value: string) {
    storage[key] = value;
    return null;
  },
  async removeItem(key: string) {
    delete storage[key];
    return null;
  },
  async clear() {
    for (const k of Object.keys(storage)) delete storage[k];
    return null;
  },
  // helper for tests
  __INTERNAL__storage: storage
};
