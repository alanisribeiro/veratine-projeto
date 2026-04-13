import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import { useAppContext } from '../context/AppContext';
import { couponsAPI, ordersAPI } from '../api/api';
import '../styles/Cart.css';

export default function Cart() {
  const { cart, removeFromCart, clearCart, token, isGuest } = useAppContext();
  const navigate = useNavigate();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [quantities, setQuantities] = useState(
    Object.fromEntries(cart.map(item => [item.id, 1]))
  );
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    setQuantities(prev => ({
      ...prev,
      [productId]: newQuantity
    }));
  };

  const handleRemoveItem = (productId) => {
    removeFromCart(productId);
  };

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => {
      const quantity = quantities[item.id] || 1;
      return total + (item.price * quantity);
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const discount = appliedCoupon?.discount || 0;
  const shipping = subtotal > 0 ? 10 : 0;
  const total = subtotal - discount + shipping;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    if (!token || isGuest) {
      setCouponError('Faca login para usar cupons');
      return;
    }
    setCouponLoading(true);
    setCouponError('');
    try {
      const res = await couponsAPI.validate(couponCode, subtotal);
      setAppliedCoupon(res.data.coupon);
      setCouponError('');
    } catch (err) {
      setCouponError(err.response?.data?.error || 'Cupom invalido');
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const handleCheckout = async () => {
    if (!token || isGuest) {
      navigate('/login');
      return;
    }

    setCheckoutLoading(true);
    setCheckoutError('');

    try {
      const items = cart.map(item => ({
        productId: item.id,
        quantity: quantities[item.id] || 1,
        price: item.price
      }));

      const couponCodeToSend = appliedCoupon?.code || undefined;
      const res = await ordersAPI.create(items, total, couponCodeToSend);

      // Navigate to checkout with order info (don't clear cart yet)
      navigate('/checkout', {
        state: {
          orderId: res.data.order.id,
          total,
          items: cart.map(item => ({
            ...item,
            quantity: quantities[item.id] || 1
          }))
        }
      });
    } catch (err) {
      setCheckoutError(err.response?.data?.error || 'Erro ao finalizar pedido. Tente novamente.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="cart-container">
        <div className="cart-header">
          <h1 className="cart-title">Meu Carrinho</h1>
          {cart.length > 0 && (
            <span className="cart-count">{cart.length} {cart.length === 1 ? 'item' : 'itens'}</span>
          )}
        </div>

        {cart.length === 0 ? (
          <div className="cart-empty">
            <svg className="cart-empty-icon" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <h2 className="cart-empty-title">Carrinho vazio</h2>
            <p className="cart-empty-text">
              Nenhum produto adicionado ao carrinho. Explore nossa coleção de flores e presentes!
            </p>
            <button className="cart-empty-btn" onClick={() => navigate('/')}>
              Continuar Comprando
            </button>
          </div>
        ) : (
          <div className="cart-content">
            <div className="cart-items">
              {cart.map((item) => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-image">
                    <img src={item.image} alt={item.name} />
                  </div>

                  <div className="cart-item-info">
                    <h3 className="cart-item-name">{item.name}</h3>
                    <p className="cart-item-category">{item.category}</p>
                    <p className="cart-item-price">R$ {item.price.toFixed(2)}</p>
                  </div>

                  <div className="cart-item-quantity">
                    <button
                      className="quantity-btn"
                      onClick={() => handleQuantityChange(item.id, (quantities[item.id] || 1) - 1)}
                    >
                      −
                    </button>
                    <input
                      type="number"
                      className="quantity-input"
                      min="1"
                      value={quantities[item.id] || 1}
                      onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                    />
                    <button
                      className="quantity-btn"
                      onClick={() => handleQuantityChange(item.id, (quantities[item.id] || 1) + 1)}
                    >
                      +
                    </button>
                  </div>

                  <div className="cart-item-subtotal">
                    R$ {((item.price) * (quantities[item.id] || 1)).toFixed(2)}
                  </div>

                  <button
                    className="cart-item-remove"
                    onClick={() => handleRemoveItem(item.id)}
                    title="Remover do carrinho"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <h3 className="cart-summary-title">Resumo do Pedido</h3>

              <div className="cart-summary-row">
                <span className="cart-summary-label">Subtotal</span>
                <span className="cart-summary-value">R$ {subtotal.toFixed(2)}</span>
              </div>

              {/* Cupom de desconto */}
              <div className="cart-coupon">
                {appliedCoupon ? (
                  <div className="coupon-applied">
                    <span>Cupom <strong>{appliedCoupon.code}</strong> aplicado!</span>
                    <button className="coupon-remove" onClick={handleRemoveCoupon}>Remover</button>
                  </div>
                ) : (
                  <div className="coupon-input-row">
                    <input
                      type="text"
                      placeholder="Cupom de desconto"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="coupon-input"
                    />
                    <button className="coupon-btn" onClick={handleApplyCoupon} disabled={couponLoading}>
                      {couponLoading ? '...' : 'Aplicar'}
                    </button>
                  </div>
                )}
                {couponError && <p className="coupon-error">{couponError}</p>}
              </div>

              {discount > 0 && (
                <div className="cart-summary-row cart-discount-row">
                  <span className="cart-summary-label">Desconto</span>
                  <span className="cart-summary-value cart-discount-value">- R$ {discount.toFixed(2)}</span>
                </div>
              )}

              <div className="cart-summary-row">
                <span className="cart-summary-label">Frete</span>
                <span className="cart-summary-value">R$ {shipping.toFixed(2)}</span>
              </div>

              <div className="cart-summary-divider"></div>

              <div className="cart-summary-row cart-summary-total">
                <span className="cart-summary-label">Total</span>
                <span className="cart-summary-value">R$ {total.toFixed(2)}</span>
              </div>

              {checkoutError && <p className="cart-checkout-error">{checkoutError}</p>}
              <button
                className="cart-checkout-btn"
                onClick={handleCheckout}
                disabled={checkoutLoading}
              >
                {checkoutLoading ? 'Processando...' : 'Finalizar Compra'}
              </button>
              <button className="cart-continue-btn" onClick={() => navigate('/')}>
                Continuar Comprando
              </button>
            </div>
          </div>
        )}
      </div>
      <BottomNav />
    </>
  );
}
