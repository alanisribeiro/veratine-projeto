// =========================================
// VERATINE EMAIL TEMPLATES
// Inline CSS for maximum email client compatibility
// =========================================

const baseLayout = (content) => `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f5f2ed;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f5f2ed;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(107,91,74,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#2c2c2c 0%,#1a1a1a 100%);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:28px;font-weight:400;color:#f5f0eb;letter-spacing:1px;">Veratine</h1>
              <p style="margin:6px 0 0;font-size:10px;color:#9e8b7f;text-transform:uppercase;letter-spacing:3px;">Flores & Presentes</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:40px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#faf8f5;padding:24px 40px;border-top:1px solid #e8dfd7;text-align:center;">
              <p style="margin:0 0 8px;font-size:12px;color:#9e8b7f;">Veratine - Flores & Presentes</p>
              <p style="margin:0;font-size:11px;color:#c4b8ac;">Este e-mail foi enviado automaticamente. Por favor, nao responda.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// =========================================
// 1. WELCOME / REGISTRATION
// =========================================
export const welcomeEmail = (userName) => ({
  subject: 'Bem-vindo(a) a Veratine!',
  html: baseLayout(`
    <h2 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#2c2c2c;font-weight:400;">
      Bem-vindo(a), ${userName}!
    </h2>
    <p style="margin:0 0 16px;font-size:15px;color:#555;line-height:1.7;">
      Estamos muito felizes em te receber na <strong style="color:#6b5b4a;">Veratine</strong>. Aqui voce encontra as flores mais bonitas e presentes especiais para todos os momentos.
    </p>
    <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.7;">
      Sua conta foi criada com sucesso. Explore nosso catalogo e descubra arranjos unicos feitos com carinho.
    </p>
    <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto;">
      <tr>
        <td style="background:linear-gradient(135deg,#6b5b4a 0%,#4a3f35 100%);border-radius:8px;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" style="display:inline-block;padding:14px 32px;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;letter-spacing:0.5px;">
            Explorar Catalogo
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:24px 0 0;font-size:13px;color:#9e8b7f;text-align:center;">
      Qualquer duvida, estamos aqui para ajudar!
    </p>
  `)
});

// =========================================
// 2. ORDER CONFIRMATION
// =========================================
export const orderConfirmationEmail = (userName, order, items) => {
  const itemRows = items.map(item => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #f0ebe5;font-size:14px;color:#444;">
        ${item.name || item.product_name} <span style="color:#9e8b7f;">x${item.quantity}</span>
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #f0ebe5;font-size:14px;color:#2c2c2c;text-align:right;font-weight:600;">
        R$ ${(item.price_at_purchase * item.quantity).toFixed(2)}
      </td>
    </tr>
  `).join('');

  return {
    subject: `Pedido #${order.id} confirmado - Veratine`,
    html: baseLayout(`
      <h2 style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#2c2c2c;font-weight:400;">
        Pedido Confirmado!
      </h2>
      <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.7;">
        Ola, <strong>${userName}</strong>! Recebemos seu pedido e ele ja esta sendo processado.
      </p>

      <!-- Order badge -->
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:24px;">
        <tr>
          <td style="background:#faf8f5;border:1px solid #e8dfd7;border-radius:10px;padding:16px 20px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
              <tr>
                <td>
                  <p style="margin:0;font-size:12px;color:#9e8b7f;text-transform:uppercase;letter-spacing:1px;">Pedido</p>
                  <p style="margin:4px 0 0;font-size:20px;font-weight:700;color:#2c2c2c;">#${order.id}</p>
                </td>
                <td style="text-align:right;">
                  <p style="margin:0;font-size:12px;color:#9e8b7f;text-transform:uppercase;letter-spacing:1px;">Status</p>
                  <p style="margin:4px 0 0;">
                    <span style="display:inline-block;background:#f5ebe0;color:#8b6914;padding:4px 12px;border-radius:12px;font-size:12px;font-weight:600;">Pendente</span>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <!-- Items -->
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:16px;">
        <tr>
          <td style="padding:0 0 8px;font-size:12px;color:#9e8b7f;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #e8dfd7;">Itens</td>
          <td style="padding:0 0 8px;font-size:12px;color:#9e8b7f;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #e8dfd7;text-align:right;">Valor</td>
        </tr>
        ${itemRows}
        <tr>
          <td style="padding:14px 0 0;font-size:16px;font-weight:700;color:#2c2c2c;">Total</td>
          <td style="padding:14px 0 0;font-size:18px;font-weight:700;color:#6b5b4a;text-align:right;">R$ ${(order.total_price || 0).toFixed(2)}</td>
        </tr>
      </table>

      <p style="margin:24px 0 0;font-size:13px;color:#9e8b7f;text-align:center;">
        Voce recebera atualizacoes sobre o status do seu pedido por e-mail.
      </p>
    `)
  };
};

// =========================================
// 3. ORDER STATUS UPDATE
// =========================================
export const orderStatusEmail = (userName, orderId, newStatus, totalPrice) => {
  const statusConfig = {
    paid: { label: 'Pago', color: '#2e7d32', bg: '#e8f5e9', message: 'O pagamento do seu pedido foi confirmado! Estamos preparando tudo com carinho.' },
    shipped: { label: 'Enviado', color: '#1565c0', bg: '#e3f2fd', message: 'Seu pedido saiu para entrega! Em breve suas flores estarao com voce.' },
    delivered: { label: 'Entregue', color: '#6b5b4a', bg: '#f5ebe0', message: 'Seu pedido foi entregue com sucesso! Esperamos que voce ame suas flores.' },
    cancelled: { label: 'Cancelado', color: '#c62828', bg: '#ffebee', message: 'Seu pedido foi cancelado. Se voce nao solicitou o cancelamento, entre em contato conosco.' },
    pending: { label: 'Pendente', color: '#8b6914', bg: '#f5ebe0', message: 'Seu pedido esta pendente de pagamento.' }
  };

  const config = statusConfig[newStatus] || statusConfig.pending;

  return {
    subject: `Pedido #${orderId} - ${config.label} - Veratine`,
    html: baseLayout(`
      <h2 style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#2c2c2c;font-weight:400;">
        Atualizacao do Pedido #${orderId}
      </h2>
      <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.7;">
        Ola, <strong>${userName}</strong>!
      </p>

      <!-- Status badge -->
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:24px;">
        <tr>
          <td style="background:${config.bg};border-radius:10px;padding:20px 24px;text-align:center;">
            <p style="margin:0 0 4px;font-size:12px;color:#9e8b7f;text-transform:uppercase;letter-spacing:1px;">Novo Status</p>
            <p style="margin:0;font-size:24px;font-weight:700;color:${config.color};">${config.label}</p>
          </td>
        </tr>
      </table>

      <p style="margin:0 0 16px;font-size:15px;color:#555;line-height:1.7;">
        ${config.message}
      </p>

      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:24px;">
        <tr>
          <td style="background:#faf8f5;border:1px solid #e8dfd7;border-radius:10px;padding:14px 20px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
              <tr>
                <td style="font-size:14px;color:#9e8b7f;">Pedido</td>
                <td style="font-size:14px;color:#2c2c2c;font-weight:600;text-align:right;">#${orderId}</td>
              </tr>
              <tr>
                <td style="font-size:14px;color:#9e8b7f;padding-top:8px;">Total</td>
                <td style="font-size:14px;color:#6b5b4a;font-weight:700;text-align:right;padding-top:8px;">R$ ${(totalPrice || 0).toFixed(2)}</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <p style="margin:0;font-size:13px;color:#9e8b7f;text-align:center;">
        Obrigado por escolher a Veratine!
      </p>
    `)
  };
};

// =========================================
// 4. PASSWORD RESET
// =========================================
export const passwordResetEmail = (userName, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

  return {
    subject: 'Redefinir sua senha - Veratine',
    html: baseLayout(`
      <h2 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#2c2c2c;font-weight:400;">
        Redefinicao de Senha
      </h2>
      <p style="margin:0 0 16px;font-size:15px;color:#555;line-height:1.7;">
        Ola, <strong>${userName}</strong>! Recebemos uma solicitacao para redefinir a senha da sua conta na Veratine.
      </p>
      <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.7;">
        Clique no botao abaixo para criar uma nova senha. Este link expira em <strong>1 hora</strong>.
      </p>

      <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto 24px;">
        <tr>
          <td style="background:linear-gradient(135deg,#6b5b4a 0%,#4a3f35 100%);border-radius:8px;">
            <a href="${resetUrl}" style="display:inline-block;padding:14px 32px;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;letter-spacing:0.5px;">
              Redefinir Senha
            </a>
          </td>
        </tr>
      </table>

      <p style="margin:0 0 8px;font-size:13px;color:#9e8b7f;">
        Se o botao nao funcionar, copie e cole este link no navegador:
      </p>
      <p style="margin:0 0 24px;font-size:12px;color:#6b5b4a;word-break:break-all;">
        ${resetUrl}
      </p>

      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        <tr>
          <td style="background:#fdf6ea;border:1px solid #e8d5b0;border-radius:8px;padding:12px 16px;">
            <p style="margin:0;font-size:13px;color:#8b6914;">
              Se voce nao solicitou esta redefinicao, pode ignorar este e-mail com seguranca. Sua senha nao sera alterada.
            </p>
          </td>
        </tr>
      </table>
    `)
  };
};
