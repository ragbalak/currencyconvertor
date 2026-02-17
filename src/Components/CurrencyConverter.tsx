import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Row, Col, Typography, theme, Divider, Card, Form } from 'antd';
import { Input, Button, Tooltip, Statistic, Alert, Space, Spin } from 'antd';
import { SwapOutlined, ReloadOutlined } from '@ant-design/icons';
import CurrencyDropdown from './CurrencyDropdown';

const { Title, Text } = Typography;
const { Timer } = Statistic;
const { useToken } = theme;

interface Rates { [key: string]: number; }
interface Currencies { [key: string]: string; }


const CurrencyConverter: React.FC = () => {
  const { token } = useToken();

  const [rates, setRates] = useState<Rates>({});
  const [currencies, setCurrencies] = useState<Currencies>({});
  const [amount, setAmount] = useState<string>('');
  const [fromCurrency, setFromCurrency] = useState<string>('GBP');
  const [toCurrency, setToCurrency] = useState<string>('USD');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [deadline, setDeadline] = useState<number | null>(null);

  const [loadingCurrencies, setLoadingCurrencies] = useState(false);
  const [loadingRates, setLoadingRates] = useState(false);
  const [fetchError, setFetchError] = useState('');

  const amountInputId = 'amount-input';
  const fromId = 'from-currency';
  const toId = 'to-currency';
  const errorId = 'converter-error';
  const helpId = 'amount-help';
  const mainFormId = 'converter-form';

  const resultLiveRef = useRef<string>('');
  const expiryLiveRef = useRef<string>('');

  useEffect(() => {
    let cancelled = false;
    setLoadingCurrencies(true);
    setFetchError('');
    fetch('https://openexchangerates.org/api/currencies.json')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load currency list');
        return res.json();
      })
      .then((data) => { if (!cancelled) setCurrencies(data); })
      .catch(() => { if (!cancelled) setFetchError('Unable to load the currency list. Try again.'); })
      .finally(() => { if (!cancelled) setLoadingCurrencies(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!fromCurrency) return;
    let cancelled = false;
    setLoadingRates(true);
    setFetchError('');
    fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load exchange rates');
        return res.json();
      })
      .then((data) => { if (!cancelled) setRates(data.rates || {}); })
      .catch(() => { if (!cancelled) setFetchError('Unable to load the latest exchange rates. Try again.'); })
      .finally(() => { if (!cancelled) setLoadingRates(false); });
    return () => { cancelled = true; };
  }, [fromCurrency]);

  const validateAmount = (value: string): boolean => /^\d+(\.\d{1,2})?$/.test(value);

  const resetResult = () => { setResult(null); setDeadline(null); };

  const handleConvert = () => {
    resetResult();

    if (amount.trim() === '') {
      setError('Please enter an amount.');
      return;
    }
    if (!validateAmount(amount)) {
      setError(`${amount} is not a valid number (use up to 2 decimals).`);
      return;
    }
    if (!fromCurrency || !toCurrency) {
      setError('Please select both currencies.');
      return;
    }
    if (fromCurrency === toCurrency) {
      setError('Please select two different currencies.');
      return;
    }
    if (!rates || Object.keys(rates).length === 0) {
      setError('Rates are not available. Please try again.');
      return;
    }

    setError('');

    const baseFrom = rates[fromCurrency] ?? 1;
    const target = rates[toCurrency];
    if (typeof target !== 'number') {
      setError('Selected target currency is not available in current rates.');
      return;
    }

    const converted = (parseFloat(amount) / baseFrom) * target;
    const formatted = new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(converted);

    setResult(formatted);
    resultLiveRef.current = `${amount} ${fromCurrency} equals ${formatted} ${toCurrency}.`;

    const tenMinutes = 10 * 60 * 1000;
    const expiry = Date.now() + tenMinutes;
    setDeadline(expiry);
    expiryLiveRef.current = `Conversion result will expire in 10 minutes.`;
  };

  const handleSwitch = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    resetResult();
  };

  const getFlagUrl = (currencyCode: string): string => {
    const countryCode = currencyCode?.slice(0, 2)?.toLowerCase();
    return countryCode
      ? `https://flagcdn.com/24x18/${countryCode}.png`
      : 'https://via.placeholder.com/24x18';
  };

  const isBusy = loadingCurrencies || loadingRates;
  const resultText = useMemo(
    () => (result ? `${amount} ${fromCurrency} is equivalent to ${result} ${toCurrency}.` : ''),
    [amount, fromCurrency, result, toCurrency]
  );

  return (
    <main
      aria-labelledby="page-title"
      style={{
        padding: '50px 20px',
        background: token.colorBgLayout,
        minHeight: '100vh',
      }}
    >
      <Row justify="center" gutter={[16, 16]}>
        <Col span={24}>
          <Title id="page-title" level={4} style={{ textAlign: 'center' }}>
            Currency Converter
          </Title>
        </Col>
        <Col xs={24} sm={20} md={16} lg={12}>
          <section
            aria-label="Conversion panel"
            style={{
              padding: token.paddingLG,
              background: token.colorBgContainer,
              borderRadius: token.borderRadiusLG,
              border: `1px solid ${token.colorBorderSecondary}`,
              boxShadow: token.boxShadowTertiary,
              position: 'relative',
            }}
          >
            {fetchError && (
              <Alert
                type="error"
                description={
                  <Space>
                    <span>{fetchError}</span>
                    <Button
                      icon={<ReloadOutlined />}
                      onClick={() => {
                        setFromCurrency((prev) => (prev === 'USD' ? 'GBP' : 'USD'));
                        setTimeout(() => setFromCurrency((prev) => (prev === 'USD' ? 'GBP' : 'USD')), 0);
                      }}
                    >
                      Retry
                    </Button>
                  </Space>
                }
                showIcon
                style={{ marginBottom: 16 }}
                role="alert"
              />
            )}
            <Form
              id={mainFormId}
              layout="vertical"
              onFinish={handleConvert}
              aria-describedby={error ? `${errorId}` : undefined}
            >
              <Form.Item
                label={<label htmlFor={amountInputId} style={{ fontWeight: 600 }}>Amount</label>}
                required
                help={<Text id={helpId} type="secondary">Enter a number with up to 2 decimals (Example., 1234.56).</Text>}
                validateStatus={error ? 'error' : undefined}
              >
                <Input
                  id={amountInputId}
                  size="large"
                  placeholder="Enter amount"
                  value={amount}
                  inputMode="decimal"
                  aria-label="Amount to convert"
                  aria-invalid={!!error}
                  aria-describedby={`${helpId}${error ? ` ${errorId}` : ''}`}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d*\.?\d{0,2}$/.test(value)) setAmount(value);
                  }}
                />
              </Form.Item>
              {error && (
                <div id={errorId} aria-live="assertive" style={{ marginTop: -8, marginBottom: 8 }}>
                  <Text type="danger" strong>
                    {error}
                  </Text>
                </div>
              )}

              <Divider style={{ borderTopColor: 'transparent', margin: '10px 0' }} />            
              <Form.Item
                label={<label htmlFor={fromId} style={{ fontWeight: 600 }}>From currency</label>}
              >
                <CurrencyDropdown
                  id={fromId}
                  ariaLabel="Select source currency"
                  currencies={currencies}
                  selectedCurrency={fromCurrency}
                  onChange={(code: string) => setFromCurrency(code)}
                  getFlagUrl={getFlagUrl}
                  renderOption={(code: string, name: string) => (
                    <Space>
                      <img
                        src={getFlagUrl(code)}
                        alt={`Flag of ${name || code} (${code})`}
                        width={24}
                        height={18}
                        loading="lazy"
                      />
                      <span>{code} — {name || code}</span>
                    </Space>
                  )}
                />
              </Form.Item>
              <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0 12px' }}>
                <Tooltip title="Swap currencies">
                  <Button
                    type="default"
                    icon={<SwapOutlined />}
                    aria-label="Swap from and to currencies"
                    onClick={handleSwitch}
                  >
                    Swap
                  </Button>
                </Tooltip>
              </div>
              <Form.Item
                label={<label htmlFor={toId} style={{ fontWeight: 600 }}>To currency</label>}
              >
                <CurrencyDropdown
                  id={toId}
                  ariaLabel="Select target currency"
                  currencies={currencies}
                  selectedCurrency={toCurrency}
                  onChange={(code: string) => setToCurrency(code)}
                  getFlagUrl={getFlagUrl}
                  renderOption={(code: string, name: string) => (
                    <Space>
                      <img
                        src={getFlagUrl(code)}
                        alt={`Flag of ${name || code} (${code})`}
                        width={24}
                        height={18}
                        loading="lazy"
                      />
                      <span>{code} — {name || code}</span>
                    </Space>
                  )}
                />
              </Form.Item>

              <Divider style={{ borderTopColor: 'transparent', margin: '10px 0' }} />              
              {(loadingCurrencies || loadingRates) && (
                <div aria-live="polite" style={{ marginBottom: 8 }}>
                  <Spin size="small" /> <Text type="secondary">Loading latest data…</Text>
                </div>
              )}

              {/* Result */}
              {result && (
                <div role="status" aria-live="polite" style={{ marginTop: '10px', fontWeight: 'bold' }}>
                  <Text strong>{resultText}</Text>
                </div>
              )}

              <Divider style={{ borderTopColor: 'transparent', margin: '10px 0' }} />
              {deadline && (
                <Card
                  role="group"
                  aria-label="Conversion result expiry"
                  variant="borderless"
                  style={{ backgroundColor: '#0000FF' }}
                >
                  <Timer
                    type="countdown"
                    value={deadline}
                    format="m:ss"
                    title="Expires in:"
                    styles={{
                      title: { color: '#FFFFFF', fontWeight: 600 },
                      content: { color: '#FFFFFF', fontSize: '24px' },
                    }}
                    onFinish={() => {
                      setResult(null);
                      setDeadline(null);
                      expiryLiveRef.current = 'The displayed conversion result has expired.';
                    }}
                  />
                </Card>
              )}

              <Divider style={{ borderTopColor: 'transparent', margin: '10px 0' }} />

              <Space>
                <Button type="primary" htmlType="submit" size="large" disabled={isBusy}>
                  Convert
                </Button>
                <Button
                  size="large"
                  onClick={() => {
                    setAmount('');
                    setError('');
                    resetResult();
                  }}
                >
                  Clear
                </Button>
              </Space>
            </Form>
          </section>
        </Col>
      </Row>
    </main>
  );
};

export default CurrencyConverter;