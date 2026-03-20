/* global jest */
/* eslint-disable no-unused-vars */
// Minimal mock for react-native-toast-notifications used in Jest
const ToastProvider = ({ children }) => children || null;
let _ref = null;
const mockRef = { show: jest.fn() };

function useToast() {
  return mockRef;
}

module.exports = {
  ToastProvider,
  useToast,
  // show is called on the provider ref
  __setRef: (r) => { _ref = r; },
  // default mock ref with show method
  mockRef,
};
