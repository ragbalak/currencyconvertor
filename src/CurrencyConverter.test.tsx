import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CurrencyConverter from './CurrencyConverter';

// Mock fetch for rates and currencies
beforeEach(() => {
  global.fetch = jest.fn((url) =>
    Promise.resolve({
      json: () =>
        url.includes('latest')
          ? Promise.resolve({ rates: { GBP: 1, USD: 1.25 } })
          : Promise.resolve({ GBP: 'British Pound', USD: 'US Dollar' }),
    })
  ) as jest.Mock;
});

describe('CurrencyConverter Component', () => {
  test('renders input and convert button', async () => {
    render(<CurrencyConverter />);

    // Check input and button exist
    expect(screen.getByPlaceholderText(/Enter amount/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Convert/i })
    ).toBeInTheDocument();

    // Wait for dropdowns to load
    await waitFor(() => {
      expect(screen.getByText(/GBP - British Pound/i)).toBeInTheDocument();
      expect(screen.getByText(/USD - US Dollar/i)).toBeInTheDocument();
    });
  });
  test('shows error for invalid amount', async () => {
    render(<CurrencyConverter />);

    const input = screen.getByPlaceholderText(/Enter amount/i);
    const convertButton = screen.getByRole('button', { name: /Convert/i });

    fireEvent.change(input, { target: { value: '100.0.0' } });
    fireEvent.click(convertButton);

    expect(
      await screen.findByText(/is not a valid number/i)
    ).toBeInTheDocument();
  });

  test('calculates conversion correctly', async () => {
    render(<CurrencyConverter />);

    const input = screen.getByPlaceholderText(/Enter amount/i);
    const convertButton = screen.getByRole('button', { name: /Convert/i });

    fireEvent.change(input, { target: { value: '10' } });
    fireEvent.click(convertButton);

    // Wait for result
    expect(await screen.findByText(/10 GBP = 12.50 USD/i)).toBeInTheDocument();
  });
});
