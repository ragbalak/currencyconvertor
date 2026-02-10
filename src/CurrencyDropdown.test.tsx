import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CurrencyDropdown from './Components/CurrencyDropdown';

// 1. Mock Ant Design to provide a simple HTML Select and Option
jest.mock('antd', () => {
  const actual = jest.requireActual('antd');

  // Mock Select as a functional component
  const MockSelect = ({ children, value, onChange, placeholder }: any) => (
    <select
      data-testid="currency-select"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={placeholder}
    >
      {children}
    </select>
  );

  // Mock Option as a simple option tag
  const MockOption = ({ children, value }: any) => (
    <option value={value}>{children}</option>
  );

  // Assign Option to Select so <Select.Option> or <Option> works
  (MockSelect as any).Option = MockOption;

  return {
    ...actual,
    Select: MockSelect,
  };
});

// 2. Import your component AFTER the mock

describe('CurrencyDropdown Mock Test', () => {
  const mockCurrencies = { USD: 'US Dollar', GBP: 'British Pound' };
  const mockOnChange = jest.fn();
  const mockGetFlagUrl = (code: string) => `flag-${code}.png`;

  test('renders without crashing using mocked components', () => {
    render(
      <CurrencyDropdown
        currencies={mockCurrencies}
        selectedCurrency="GBP"
        onChange={mockOnChange}
        getFlagUrl={mockGetFlagUrl}
      />
    );

    const select = screen.getByTestId('currency-select');
    expect(select).toBeInTheDocument();

    fireEvent.change(select, { target: { value: 'USD' } });
    expect(mockOnChange).toHaveBeenCalledWith('USD');
  });
});
test('renders correct URL each currency', () => {
  const mockGetFlagUrl = jest.fn((code) => `https://flags.io{code}.png`);
  const currencies = { EUR: 'Euro', JPY: 'Japanese Yen' };

  render(
    <CurrencyDropdown
      currencies={currencies}
      selectedCurrency="EUR"
      onChange={jest.fn()}
      getFlagUrl={mockGetFlagUrl}
    />
  );

  expect(mockGetFlagUrl).toHaveBeenCalledWith('JPY');
});
test('provides a searchable label containing code and name', () => {
  const currencies = { AUD: 'Australian Dollar' };

  render(
    <CurrencyDropdown
      currencies={currencies}
      selectedCurrency="AUD"
      onChange={jest.fn()}
      getFlagUrl={(code) => `flags/${code}.png`}
    />
  );
  const option = screen.getByRole('option', {
    name: /AUD - Australian Dollar/i,
  });
  expect(option).toBeInTheDocument();
});
