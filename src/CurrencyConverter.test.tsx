import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CurrencyConverter from './Components/CurrencyConverter';

jest.mock('antd', () => {
  const actual = jest.requireActual('antd');
  return {
    ...actual,
    Row: ({ children, style }: any) => <div style={style}>{children}</div>,
    Col: ({ children, style }: any) => <div style={style}>{children}</div>,
  };
});
test('shows error when From and To currencies are the same', async () => {
  render(<CurrencyConverter />);

  const input = screen.getByPlaceholderText(/Enter amount/i);
  fireEvent.change(input, { target: { value: '50' } });

  const convertBtn = screen.getByRole('button', { name: /convert/i });
  fireEvent.click(convertBtn);

  const error = await screen.findByText(
    /Please select two different currencies/i
  );
  expect(error).toBeInTheDocument();
});
test('Handling API fetch failure', async () => {
  global.fetch = jest.fn().mockImplementation((url) => {
    if (url.includes('currencies.json')) {
      return Promise.resolve({
        ok: true,
        json: async () => ({ GBP: 'British Pound', USD: 'US Dollar' }),
      });
    }
    if (url.includes('api.exchangerate-api.com')) {
      return Promise.reject(new Error('API failure'));
    }
    return Promise.resolve({ ok: false });
  });

  render(<CurrencyConverter />);

  const input = screen.getByPlaceholderText(/Enter amount/i);
  fireEvent.change(input, { target: { value: '10' } });

  fireEvent.click(screen.getByRole('button', { name: /convert/i }));

  await waitFor(() => {
    expect(screen.queryByText(/is equaivalent to/i)).not.toBeInTheDocument();
  });
});
