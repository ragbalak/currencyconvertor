import '@testing-library/jest-dom';
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false, // This is the property that was causing the crash
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated but often needed for older AntD
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
