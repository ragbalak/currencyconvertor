import React from 'react';
import { Select, Space } from 'antd';

const { Option } = Select;

interface CurrencyDropdownProps {
  id?: string;                     // ← added
  ariaLabel?: string;              // ← added
  currencies: Record<string, string>;
  selectedCurrency: string;
  onChange: (value: string) => void;
  getFlagUrl: (currencyCode: string) => string;
  renderOption?: (code: string, name: string) => React.ReactNode; // optional override
}

const CurrencyDropdown: React.FC<CurrencyDropdownProps> = ({
  id,
  ariaLabel,
  currencies,
  selectedCurrency,
  onChange,
  getFlagUrl,
  renderOption,
}) => {
  return (
    <Select
      id={id}
      aria-label={ariaLabel}
      data-testid="currency-select"
      size="large"
      style={{ width: '100%' }}
      showSearch
      value={selectedCurrency}
      onChange={onChange}
      placeholder="Select currency"
    >
      {Object.keys(currencies).map((code) => {
        const name = currencies[code];

        return (
          <Option
            key={code}
            value={code}
            label={`${code} — ${name}`}
          >
            {renderOption ? (
              renderOption(code, name)
            ) : (
              <Space>
                <img
                  src={getFlagUrl(code)}
                  alt={`Flag of ${name} (${code})`}
                  width={20}
                  height={14}
                  style={{ marginRight: 8 }}
                  loading="lazy"
                />
                <span>
                  {code} — {name}
                </span>
              </Space>
            )}
          </Option>
        );
      })}
    </Select>
  );
};

export default CurrencyDropdown;