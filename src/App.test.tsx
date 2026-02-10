import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

// Optional: mock CurrencyConverter if needed
jest.mock('./Components/CurrencyConverter', () => () => (
  <div data-testid="currency-converter">Mocked Converter</div>
));

describe('App Component', () => {
  test('renders CurrencyConverter component', () => {
    render(<App />);
    expect(screen.getByTestId('currency-converter')).toBeInTheDocument();
  });
});
