import React, { useEffect, useState } from 'react';
import { Input, Button, Typography, Tooltip, Statistic } from 'antd';
import CurrencyDropdown from './CurrencyDropdown';
import { Col, Row, Card } from 'antd';
import { SwapOutlined } from '@ant-design/icons';
const { Text } = Typography;
const { Countdown } = Statistic;

interface Rates {
  [key: string]: number;
}

interface Currencies {
  [key: string]: string;
}

const CurrencyConverter: React.FC = () => {
  const [rates, setRates] = useState<Rates>({});
  const [currencies, setCurrencies] = useState<Currencies>({});
  const [amount, setAmount] = useState<string>('');
  const [fromCurrency, setFromCurrency] = useState<string>('GBP');
  const [toCurrency, setToCurrency] = useState<string>('USD');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [deadline, setDeadline] = useState<number | null>(null);

  useEffect(() => {
    fetch('https://api.exchangerate-api.com/v4/latest/GBP')
      .then((res) => res.json())
      .then((data) => setRates(data.rates))
      .catch((err) => console.error(err));

    fetch('https://openexchangerates.org/api/currencies.json')
      .then((res) => res.json())
      .then((data) => setCurrencies(data))
      .catch((err) => console.error(err));
  }, []);

  const validateAmount = (value: string): boolean =>
    /^\d+(\.\d{1,2})?$/.test(value);

  const handleConvert = (): void => {
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
    <Row justify="center" align="middle">
      <Col>
        <Card title="Currency Converter">
          <Row justify="center" align="middle">
            <Col span={24}>
              <Input
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                // Add icon inside the input (right side)
                suffix={
                  <Tooltip title="Convert">
                    <SwapOutlined
                      style={{ color: '#1890ff', cursor: 'pointer' }}
                      onClick={() => {
                        handleSwitch();
                      }}
                    />
                  </Tooltip>
                }
              />
              {error && <Text type="danger">{error}</Text>}
            </Col>
          </Row>
          <Row>
            <Col span={24}>&nbsp;</Col>
          </Row>
          <Row justify="center" align="middle">
            <Col span={24}>
              <CurrencyDropdown
                currencies={currencies}
                selectedCurrency={fromCurrency}
                onChange={setFromCurrency}
                getFlagUrl={getFlagUrl}
              />
            </Col>
          </Row>
          <Row justify="center" align="middle">
            <Col span={24}>&nbsp;</Col>
          </Row>
          <Row>
            <Col span={24}>
              <CurrencyDropdown
                currencies={currencies}
                selectedCurrency={toCurrency}
                onChange={setToCurrency}
                getFlagUrl={getFlagUrl}
              />
            </Col>
          </Row>
          <Row justify="center" align="middle">
            <Col span={24}>&nbsp;</Col>
          </Row>
          <Row>
            <Col span={24}>
              {result && (
                <p style={{ marginTop: '10px', fontWeight: 'bold' }}>
                  {amount} {fromCurrency} is equaivalent to {result}{' '}
                  {toCurrency}
                </p>
              )}
            </Col>
          </Row>
          <Row>
            <Col span={24}>&nbsp;</Col>
          </Row>
          <Row justify="center" align="middle">
            <Col span={24}>
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
            </Col>
          </Row>
          <Row>
            <Col span={24}>&nbsp;</Col>
          </Row>
          <Row justify="center" align="middle">
            <Col span={24} style={{ textAlign: 'center' }}>
              <Button type="primary" onClick={handleConvert} size="large">
                Convert
              </Button>
            </Col>
          </Row>
        </Card>
      </Col>
    </Row>
  );
};

export default CurrencyConverter;
