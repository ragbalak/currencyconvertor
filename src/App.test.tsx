import React from 'react';
import 'antd/dist/reset.css';
import { render, screen } from '@testing-library/react';
import CurrencyConverter from './Components/CurrencyConverter';

beforeAll(() => {
  window.matchMedia = jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));
});

test('renders Currency Converter text', () => {
  render(<CurrencyConverter />);
  const linkElement = screen.getByText(/Currency Converter/i);
  expect(linkElement).toBeInTheDocument();
});
