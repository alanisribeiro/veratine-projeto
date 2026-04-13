import React from 'react';
import '../styles/Footer.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="footer-brand">
          <div className="footer-logo">
            <svg className="footer-logo-icon" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 4C16 4 12 8 12 12C12 14.2 13.8 16 16 16C18.2 16 20 14.2 20 12C20 8 16 4 16 4Z" fill="currentColor" opacity="0.6"/>
              <path d="M10 8C10 8 6 10 6 14C6 16.2 7.8 18 10 18C12.2 18 14 16.2 14 14C14 10 10 8 10 8Z" fill="currentColor" opacity="0.4"/>
              <path d="M22 8C22 8 26 10 26 14C26 16.2 24.2 18 22 18C19.8 18 18 16.2 18 14C18 10 22 8 22 8Z" fill="currentColor" opacity="0.4"/>
              <path d="M16 16C16 16 16 28 16 28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M16 20C13 20 11 18 11 18" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
              <path d="M16 22C19 22 21 20 21 20" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
            </svg>
            <div className="footer-logo-text">
              <span className="footer-logo-name">Veratine</span>
              <span className="footer-logo-tagline">FLORES & PRESENTES</span>
            </div>
          </div>
          <p className="footer-brand-desc">
            Flores frescas selecionadas com carinho, arranjos exclusivos e entregas com cuidado artesanal para tornar cada momento especial.
          </p>
          <div className="footer-social">
            <a href="#" className="social-link" aria-label="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5"/>
                <circle cx="12" cy="12" r="5"/>
                <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/>
              </svg>
            </a>
            <a href="#" className="social-link" aria-label="Facebook">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
              </svg>
            </a>
            <a href="#" className="social-link" aria-label="WhatsApp">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/>
              </svg>
            </a>
          </div>
        </div>

        <div className="footer-column">
          <h4 className="footer-col-title">Navegação</h4>
          <ul className="footer-list">
            <li><a href="/">Início</a></li>
            <li><a href="/offers">Ofertas</a></li>
            <li><a href="/favorites">Favoritos</a></li>
            <li><a href="/cart">Carrinho</a></li>
          </ul>
        </div>

        <div className="footer-column">
          <h4 className="footer-col-title">Central de Atendimento</h4>
          <ul className="footer-list">
            <li><a href="#">Perguntas Frequentes</a></li>
            <li><a href="#">Rastrear Pedido</a></li>
            <li><a href="#">Trocas e Devoluções</a></li>
            <li><a href="#">Prazos de Entrega</a></li>
            <li><a href="#">Fale Conosco</a></li>
          </ul>
        </div>

        <div className="footer-column">
          <h4 className="footer-col-title">Diretrizes</h4>
          <ul className="footer-list">
            <li><a href="#">Política de Privacidade</a></li>
            <li><a href="#">Termos de Uso</a></li>
            <li><a href="#">Política de Cookies</a></li>
            <li><a href="#">Garantia de Frescor</a></li>
            <li><a href="#">Cuidados com as Flores</a></li>
          </ul>
        </div>

        <div className="footer-column">
          <h4 className="footer-col-title">Contato</h4>
          <div className="footer-contact-items">
            <div className="footer-contact-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
              </svg>
              <span>(11) 94628-2763</span>
            </div>
            <div className="footer-contact-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <span>contato@veratine.com</span>
            </div>
            <div className="footer-contact-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              <span>Seg a Sex, 8h - 18h</span>
            </div>
            <div className="footer-contact-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span>São Paulo, SP - Brasil</span>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-divider" />

      <div className="footer-bottom">
        <p className="footer-copyright">
          {currentYear} Veratine. Todos os direitos reservados.
        </p>
        <div className="footer-payment">
          <span className="footer-payment-label">Formas de Pagamento</span>
          <div className="footer-payment-methods">
            <span className="payment-badge">PIX</span>
            <span className="payment-badge">Visa</span>
            <span className="payment-badge">Master</span>
            <span className="payment-badge">Boleto</span>
          </div>
        </div>
        <div className="footer-security">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0110 0v4"/>
          </svg>
          <span>Compra 100% Segura</span>
        </div>
      </div>
    </footer>
  );
}
