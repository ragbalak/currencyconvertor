import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CurrencyDropdown from './Components/CurrencyDropdown';
import userEvent from '@testing-library/user-event';

describe('CurrencyDropdown Component', () => {
  const currencies = {
    GBP: 'British Pound',
    USD: 'US Dollar',
    EUR: 'Euro',
  };

  const mockGetFlagUrl = (code: string) => `https://flagcdn.com/${code}.png`;
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders dropdown with selected currency', () => {
    render(
      <CurrencyDropdown
        currencies={currencies}
        selectedCurrency="GBP"
        onChange={mockOnChange}
        getFlagUrl={mockGetFlagUrl}
      />
    );

    // Selected value should be visible
    expect(screen.getByText(/GBP - British Pound/i)).toBeInTheDocument();
  });
  test('uses the getFlagUrl function to render images', () => {
    render(
      <CurrencyDropdown
        currencies={currencies}
        selectedCurrency="GBP"
        onChange={mockOnChange}
        getFlagUrl={mockGetFlagUrl}
      />
    );
    const selectedFlag = screen.getByAltText('GBP');
    expect(selectedFlag).toBeInTheDocument();
  });
});
