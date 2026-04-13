import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import { useAppContext } from '../context/AppContext';
import { paymentsAPI } from '../api/api';
import '../styles/Checkout.css';

const MP_PUBLIC_KEY = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY;

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearCart } = useAppContext();

  const { orderId, total, items } = location.state || {};

  const [paymentMethod, setPaymentMethod] = useState(null); // 'pix' | 'credit_card'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentResult, setPaymentResult] = useState(null);
  const [pixData, setPixData] = useState(null);
  const [pixTimeLeft, setPixTimeLeft] = useState(0);
  const [copied, setCopied] = useState(false);
  const pollingRef = useRef(null);
  const timerRef = useRef(null);

  // Credit card form state
  const [cardForm, setCardForm] = useState({
    cardNumber: '',
    cardHolder: '',
    expiry: '',
    cvv: '',
    cpf: '',
    installments: 1,
  });

  // Redirect if no order data
  useEffect(() => {
    if (!orderId) {
      navigate('/cart');
    }
  }, [orderId, navigate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // PIX countdown timer
  useEffect(() => {
    if (pixData?.pix_expiration) {
      const updateTimer = () => {
        const now = Date.now();
        const exp = new Date(pixData.pix_expiration).getTime();
        const diff = Math.max(0, Math.floor((exp - now) / 1000));
        setPixTimeLeft(diff);
        if (diff <= 0 && timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
      updateTimer();
      timerRef.current = setInterval(updateTimer, 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [pixData]);

  // Poll PIX payment status
  const startPixPolling = useCallback((oid) => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    pollingRef.current = setInterval(async () => {
      try {
        const res = await paymentsAPI.getStatus(oid);
        if (res.data.payment_status === 'approved' || res.data.status === 'paid') {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
          setPaymentResult({ status: 'approved', payment_method: 'pix' });
          clearCart();
        }
      } catch (e) {
        // Ignore polling errors
      }
    }, 5000);
  }, [clearCart]);

  // Process PIX payment
  const handlePixPayment = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await paymentsAPI.process({
        orderId,
        payment_method: 'pix',
      });

      setPixData({
        pix_qr_code: res.data.pix_qr_code,
        pix_qr_code_text: res.data.pix_qr_code_text,
        pix_expiration: res.data.pix_expiration,
      });

      if (res.data.status === 'approved') {
        setPaymentResult({ status: 'approved', payment_method: 'pix' });
        clearCart();
      } else {
        startPixPolling(orderId);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao gerar PIX');
    } finally {
      setLoading(false);
    }
  };

  // Process credit card payment
  const handleCardPayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic validation
    const num = cardForm.cardNumber.replace(/\s/g, '');
    if (num.length < 13) {
      setError('Numero do cartao invalido');
      setLoading(false);
      return;
    }
    if (!cardForm.cardHolder.trim()) {
      setError('Nome do titular obrigatorio');
      setLoading(false);
      return;
    }
    if (!cardForm.cpf.replace(/\D/g, '').match(/^\d{11}$/)) {
      setError('CPF invalido');
      setLoading(false);
      return;
    }

    try {
      const res = await paymentsAPI.process({
        orderId,
        payment_method: 'credit_card',
        installments: cardForm.installments,
        // In simulation mode, token is not needed
        token: 'sim_token_' + Date.now(),
        payment_method_id: 'master',
        issuer_id: '1',
        identificationType: 'CPF',
        identificationNumber: cardForm.cpf.replace(/\D/g, ''),
      });

      if (res.data.status === 'approved') {
        setPaymentResult({
          status: 'approved',
          payment_method: 'credit_card',
          installments: res.data.installments,
        });
        clearCart();
      } else if (res.data.status === 'rejected') {
        setError('Pagamento recusado. Verifique os dados do cartao.');
      } else {
        setPaymentResult({ status: res.data.status, payment_method: 'credit_card' });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao processar pagamento');
    } finally {
      setLoading(false);
    }
  };

  // Simulate PIX approval (dev only)
  const handleSimulateApprove = async () => {
    try {
      await paymentsAPI.simulateApprove(orderId);
      setPaymentResult({ status: 'approved', payment_method: 'pix' });
      clearCart();
    } catch (err) {
      setError('Erro ao simular aprovacao');
    }
  };

  // Copy PIX code
  const handleCopyPix = () => {
    if (pixData?.pix_qr_code_text) {
      navigator.clipboard.writeText(pixData.pix_qr_code_text);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  // Format helpers
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatCardNumber = (value) => {
    return value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim().slice(0, 19);
  };

  const formatExpiry = (value) => {
    const nums = value.replace(/\D/g, '');
    if (nums.length >= 2) return nums.slice(0, 2) + '/' + nums.slice(2, 4);
    return nums;
  };

  const formatCPF = (value) => {
    const nums = value.replace(/\D/g, '').slice(0, 11);
    if (nums.length > 9) return nums.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    if (nums.length > 6) return nums.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    if (nums.length > 3) return nums.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    return nums;
  };

  const installmentOptions = () => {
    const opts = [];
    const maxInstallments = total >= 100 ? 12 : total >= 50 ? 6 : 3;
    for (let i = 1; i <= maxInstallments; i++) {
      const val = (total / i).toFixed(2);
      opts.push(
        <option key={i} value={i}>
          {i}x de R$ {val} {i === 1 ? '(a vista)' : 'sem juros'}
        </option>
      );
    }
    return opts;
  };

  if (!orderId) return null;

  // ---- SUCCESS SCREEN ----
  if (paymentResult?.status === 'approved') {
    return (
      <>
        <Header />
        <div className="checkout-container">
          <div className="checkout-success">
            <div className="success-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h2>Pagamento Aprovado!</h2>
            <p className="success-order-id">Pedido #{orderId}</p>
            <p className="success-detail">
              {paymentResult.payment_method === 'pix'
                ? 'Pagamento via PIX confirmado.'
                : `Pagamento no cartao em ${paymentResult.installments || 1}x aprovado.`}
            </p>
            <p className="success-email">Voce recebera um e-mail de confirmacao em breve.</p>
            <div className="success-actions">
              <button className="btn-primary" onClick={() => navigate('/account')}>
                Ver Meus Pedidos
              </button>
              <button className="btn-secondary" onClick={() => navigate('/')}>
                Continuar Comprando
              </button>
            </div>
          </div>
        </div>
        <BottomNav />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="checkout-container">
        <div className="checkout-header">
          <button className="checkout-back" onClick={() => navigate('/cart')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <h1>Pagamento</h1>
        </div>

        {/* Order summary */}
        <div className="checkout-summary">
          <h3>Resumo do Pedido #{orderId}</h3>
          <div className="checkout-items">
            {items?.map(item => (
              <div key={item.id} className="checkout-item">
                <img src={item.image} alt={item.name} />
                <div className="checkout-item-info">
                  <span className="checkout-item-name">{item.name}</span>
                  <span className="checkout-item-qty">{item.quantity}x R$ {item.price.toFixed(2)}</span>
                </div>
                <span className="checkout-item-total">R$ {(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="checkout-total">
            <span>Total</span>
            <strong>R$ {total?.toFixed(2)}</strong>
          </div>
        </div>

        {/* Payment method selection */}
        {!pixData && (
          <div className="payment-methods">
            <h3>Forma de Pagamento</h3>
            <div className="payment-options">
              <button
                className={`payment-option ${paymentMethod === 'pix' ? 'active' : ''}`}
                onClick={() => { setPaymentMethod('pix'); setError(''); }}
              >
                <div className="payment-option-icon pix-icon">
                  <img src="/images/pix-logo.svg" alt="PIX" width="32" height="32" />
                </div>
                <div className="payment-option-text">
                  <span className="payment-option-title">PIX</span>
                  <span className="payment-option-desc">Aprovacao instantanea</span>
                </div>
              </button>

              <button
                className={`payment-option ${paymentMethod === 'credit_card' ? 'active' : ''}`}
                onClick={() => { setPaymentMethod('credit_card'); setError(''); }}
              >
                <div className="payment-option-icon card-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                    <line x1="1" y1="10" x2="23" y2="10"></line>
                  </svg>
                </div>
                <div className="payment-option-text">
                  <span className="payment-option-title">Cartao de Credito</span>
                  <span className="payment-option-desc">Ate 12x sem juros</span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* PIX Payment */}
        {paymentMethod === 'pix' && !pixData && (
          <div className="pix-section">
            <button className="btn-primary btn-full" onClick={handlePixPayment} disabled={loading}>
              {loading ? 'Gerando PIX...' : 'Gerar QR Code PIX'}
            </button>
          </div>
        )}

        {pixData && (
          <div className="pix-payment">
            <h3>Pague com PIX</h3>
            <div className="pix-timer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>Expira em {formatTime(pixTimeLeft)}</span>
            </div>

            <div className="pix-qr-container">
              {pixData.pix_qr_code ? (
                <img src={pixData.pix_qr_code} alt="QR Code PIX" className="pix-qr-image" />
              ) : (
                <div className="pix-qr-placeholder">QR Code</div>
              )}
            </div>

            <div className="pix-copy-section">
              <p className="pix-copy-label">Ou copie o codigo PIX:</p>
              <div className="pix-copy-row">
                <input
                  type="text"
                  readOnly
                  value={pixData.pix_qr_code_text || ''}
                  className="pix-copy-input"
                />
                <button className="pix-copy-btn" onClick={handleCopyPix}>
                  {copied ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
            </div>

            <div className="pix-waiting">
              <div className="pix-spinner"></div>
              <p>Aguardando pagamento...</p>
            </div>

            {/* Dev: simulate approval */}
            <button className="btn-simulate" onClick={handleSimulateApprove}>
              [DEV] Simular Pagamento Aprovado
            </button>
          </div>
        )}

        {/* Credit Card Form */}
        {paymentMethod === 'credit_card' && !paymentResult && (
          <form className="card-form" onSubmit={handleCardPayment}>
            <h3>Dados do Cartao</h3>

            <div className="form-group">
              <label>Numero do Cartao</label>
              <input
                type="text"
                placeholder="0000 0000 0000 0000"
                value={cardForm.cardNumber}
                onChange={(e) => setCardForm(prev => ({ ...prev, cardNumber: formatCardNumber(e.target.value) }))}
                maxLength={19}
                required
              />
            </div>

            <div className="form-group">
              <label>Nome do Titular</label>
              <input
                type="text"
                placeholder="Como no cartao"
                value={cardForm.cardHolder}
                onChange={(e) => setCardForm(prev => ({ ...prev, cardHolder: e.target.value.toUpperCase() }))}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Validade</label>
                <input
                  type="text"
                  placeholder="MM/AA"
                  value={cardForm.expiry}
                  onChange={(e) => setCardForm(prev => ({ ...prev, expiry: formatExpiry(e.target.value) }))}
                  maxLength={5}
                  required
                />
              </div>
              <div className="form-group">
                <label>CVV</label>
                <input
                  type="text"
                  placeholder="123"
                  value={cardForm.cvv}
                  onChange={(e) => setCardForm(prev => ({ ...prev, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                  maxLength={4}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>CPF do Titular</label>
              <input
                type="text"
                placeholder="000.000.000-00"
                value={cardForm.cpf}
                onChange={(e) => setCardForm(prev => ({ ...prev, cpf: formatCPF(e.target.value) }))}
                maxLength={14}
                required
              />
            </div>

            <div className="form-group">
              <label>Parcelas</label>
              <select
                value={cardForm.installments}
                onChange={(e) => setCardForm(prev => ({ ...prev, installments: parseInt(e.target.value) }))}
              >
                {installmentOptions()}
              </select>
            </div>

            <button type="submit" className="btn-primary btn-full" disabled={loading}>
              {loading ? 'Processando...' : `Pagar R$ ${total?.toFixed(2)}`}
            </button>
          </form>
        )}

        {error && <div className="checkout-error">{error}</div>}
      </div>
      <BottomNav />
    </>
  );
}
