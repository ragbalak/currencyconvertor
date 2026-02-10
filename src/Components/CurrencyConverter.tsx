import React, { useEffect, useState } from 'react';
import { Row, Col, Typography, theme, Divider, Card } from 'antd';
import { Input, Button, Tooltip, Statistic } from 'antd';
import CurrencyDropdown from './CurrencyDropdown';
import { SwapOutlined } from '@ant-design/icons';
const { Title } = Typography;
const { Countdown } = Statistic;
const { useToken } = theme;

interface Rates {
  [key: string]: number;
}

interface Currencies {
  [key: string]: string;
}

const CurrencyConverter = () => {
  const { token } = useToken(); // Use design tokens for React 18/AntD 5 consistency
  const [rates, setRates] = useState<Rates>({});
  const [currencies, setCurrencies] = useState<Currencies>({});
  const [amount, setAmount] = useState<string>('');
  const [fromCurrency, setFromCurrency] = useState<string>('GBP');
  const [toCurrency, setToCurrency] = useState<string>('USD');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [deadline, setDeadline] = useState<number | null>(null);
  useEffect(() => {
    fetch('https://openexchangerates.org/api/currencies.json')
      .then((res) => res.json())
      .then((data) => setCurrencies(data))
      .catch((err) => console.error(err));
  }, []);
  useEffect(() => {
    if (fromCurrency) {
      fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`)
        .then((res) => res.json())
        .then((data) => setRates(data.rates))
        .catch((err) => console.error(err));
    }
  }, [fromCurrency]);

  const validateAmount = (value: string): boolean =>
    /^\d+(\.\d{1,2})?$/.test(value);

  const handleConvert = (): void => {
    resultreset();
    if (amount === '') {
      setError(`Please Enter Amount`);
      setResult(null);
      return;
    }
    if (rates[fromCurrency] === rates[toCurrency]) {
      setError(`Please select two different currencies`);
      setResult(null);
      return;
    }
    if (!validateAmount(amount)) {
      setError(`${amount} is not a valid number`);
      setResult(null);
      return;
    }
    setError('');
    const converted =
      (parseFloat(amount) / rates[fromCurrency]) * rates[toCurrency];
    setResult(converted.toFixed(2));
    setDeadline(Date.now() + 10 * 60 * 1000);
  };
  const resultreset = (): void => {
    setResult(null);
    setDeadline(null);
  };
  const handleSwitch = (): void => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setResult(null);
    setDeadline(null);
  };

  const getFlagUrl = (currencyCode: string): string => {
    const countryCode = currencyCode.slice(0, 2).toLowerCase();
    return countryCode
      ? `https://flagcdn.com/24x18/${countryCode}.png`
      : 'https://via.placeholder.com/24x18';
  };
  return (
    <div
      style={{
        padding: '50px 20px',
        background: token.colorBgLayout,
        minHeight: '100vh',
      }}
    >
      <Row justify="center" gutter={[16, 16]}>
        <Col span={24}>
          <Title level={4} style={{ textAlign: 'center' }}>
            Currency Converter
          </Title>
        </Col>

        <Col xs={24} sm={20} md={16} lg={12}>
          <div
            style={{
              padding: token.paddingLG,
              background: token.colorBgContainer,
              borderRadius: token.borderRadiusLG,
              border: `1px solid ${token.colorBorderSecondary}`,
              boxShadow: token.boxShadowTertiary,
            }}
          >
            <p style={{ textAlign: 'center', color: token.colorTextSecondary }}>
              <Input
                size="large"
                style={{ width: '100%' }}
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => {
                  const value = e.target.value;

                  if (/^\d*\.?\d{0,2}$/.test(value)) {
                    setAmount(value);
                  }
                }}
                suffix={
                  <Tooltip title="Convert">
                    <SwapOutlined
                      data-testid="swap-icon"
                      style={{ color: '#1890ff', cursor: 'pointer' }}
                      onClick={() => {
                        handleSwitch();
                      }}
                    />
                  </Tooltip>
                }
              />

              {error && (
                <Title level={5} type="danger">
                  {error}
                </Title>
              )}
              <Divider
                style={{ borderTopColor: 'transparent', margin: '10px 0' }}
              />
              <CurrencyDropdown
                currencies={currencies}
                selectedCurrency={fromCurrency}
                onChange={setFromCurrency}
                getFlagUrl={getFlagUrl}
              />
              <Divider
                style={{ borderTopColor: 'transparent', margin: '5px 0' }}
              />
              <CurrencyDropdown
                currencies={currencies}
                selectedCurrency={toCurrency}
                onChange={setToCurrency}
                getFlagUrl={getFlagUrl}
              />
              <Divider
                style={{ borderTopColor: 'transparent', margin: '5px 0' }}
              />
              {result && (
                <p style={{ marginTop: '10px', fontWeight: 'bold' }}>
                  {amount} {fromCurrency} is equaivalent to {result}{' '}
                  {toCurrency}
                </p>
              )}
              <Divider
                style={{ borderTopColor: 'transparent', margin: '5px 0' }}
              />
              {deadline && (
                <Card
                  variant="borderless"
                  style={{ backgroundColor: '#0000FF' }}
                >
                  <Countdown
                    format="m:ss"
                    title="Expires in: "
                    styles={{
                      title: { color: '#FFFFFF', fontWeight: 600 },
                      content: { color: '#FFFFFF', fontSize: '24px' },
                    }}
                    value={deadline}
                    onFinish={() => {
                      setResult(null);
                      setDeadline(null);
                    }}
                  />
                </Card>
              )}
              <Divider
                style={{ borderTopColor: 'transparent', margin: '5px 0' }}
              />
              <Button type="primary" onClick={handleConvert} size="large">
                Convert
              </Button>
            </p>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default CurrencyConverter;
