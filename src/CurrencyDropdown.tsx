import React from 'react';
import { Select } from 'antd';

const { Option } = Select;

interface CurrencyDropdownProps {
  currencies: Record<string, string>;
  selectedCurrency: string;
  onChange: (value: string) => void;
  getFlagUrl: (currencyCode: string) => string;
}

const CurrencyDropdown: React.FC<CurrencyDropdownProps> = ({
  currencies,
  selectedCurrency,
  onChange,
  getFlagUrl,
}) => {
  return (
    <Select
      size="large"
      showSearch
      value={selectedCurrency}
      onChange={onChange}
      placeholder="Select currency"
    >
      {Object.keys(currencies).map((code) => (
        <Option
          key={code}
          value={code}
          label={`${code} - ${currencies[code]}`} // Important for search
        >
          <img
            src={getFlagUrl(code)}
            alt={code}
            style={{ width: '20px', marginRight: '8px' }}
          />
          {code} - {currencies[code]}
        </Option>
      ))}
    </Select>
  );
};

export default CurrencyDropdown;
