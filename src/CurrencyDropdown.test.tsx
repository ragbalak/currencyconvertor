
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import CurrencyDropdown from "./CurrencyDropdown";

describe("CurrencyDropdown Component", () => {
  const currencies = {
    GBP: "British Pound",
    USD: "US Dollar",
    EUR: "Euro",
  };

  const mockGetFlagUrl = (code: string) => `https://flagcdn.com/${code}.png`;
  const mockOnChange = jest.fn();

  test("renders dropdown with all currencies", () => {
    render(
      <CurrencyDropdown
        currencies={currencies}
        selectedCurrency="GBP"
        onChange={mockOnChange}
        getFlagUrl={mockGetFlagUrl}
      />
    );

    // Dropdown should show selected currency
    expect(screen.getByText(/GBP - British Pound/i)).toBeInTheDocument();
  });

  test("filters currencies based on search input", () => {
    render(
      <CurrencyDropdown
        currencies={currencies}
        selectedCurrency="GBP"
        onChange={mockOnChange}
        getFlagUrl={mockGetFlagUrl}
      />
    );

    // Open dropdown
    fireEvent.click(screen.getByText(/GBP - British Pound/i));

    // Type in search box
    const searchInput = screen.getByPlaceholderText(/Search/i);
    fireEvent.change(searchInput, { target: { value: "Euro" } });

    // Only EUR should be visible
    expect(screen.getByText(/EUR - Euro/i)).toBeInTheDocument();
    expect(screen.queryByText(/USD - US Dollar/i)).not.toBeInTheDocument();
  });

  test("shows 'No records found' when no match", () => {
    render(
      <CurrencyDropdown
        currencies={currencies}
        selectedCurrency="GBP"
        onChange={mockOnChange}
        getFlagUrl={mockGetFlagUrl}
      />
    );

    fireEvent.click(screen.getByText(/GBP - British Pound/i));

    const searchInput = screen.getByPlaceholderText(/Search/i);
    fireEvent.change(searchInput, { target: { value: "XYZ" } });

    expect(screen.getByText(/No records found/i)).toBeInTheDocument();
  });
});
