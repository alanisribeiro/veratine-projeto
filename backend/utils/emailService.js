// =========================================
// VERATINE EMAIL SERVICE
// Uses Resend for transactional emails
// Falls back gracefully when API key is not set
// =========================================

import { Resend } from 'resend';
import {
  welcomeEmail,
  orderConfirmationEmail,
  orderStatusEmail,
  passwordResetEmail
} from './emailTemplates.js';

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.EMAIL_FROM || 'Veratine <onboarding@resend.dev>';

let resend = null;
if (resendApiKey) {
  resend = new Resend(resendApiKey);
  console.log('Email service initialized with Resend');
} else {
  console.log('RESEND_API_KEY not set - emails will be logged to console');
}

const sendEmail = async (to, { subject, html }) => {
  try {
    if (!resend) {
      console.log('\n========== EMAIL (dev mode) ==========');
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log('HTML: [template rendered]');
      console.log('=======================================\n');
      return { success: true, mode: 'console' };
    }

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject,
      html
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error };
    }

    console.log(`Email sent to ${to}: ${subject} (id: ${data?.id})`);
    return { success: true, id: data?.id };
  } catch (err) {
    console.error('Email send failed:', err.message);
    return { success: false, error: err.message };
  }
};

// =========================================
// PUBLIC API
// =========================================

export const sendWelcomeEmail = async (email, userName) => {
  const template = welcomeEmail(userName);
  return sendEmail(email, template);
};

export const sendOrderConfirmationEmail = async (email, userName, order, items) => {
  const template = orderConfirmationEmail(userName, order, items);
  return sendEmail(email, template);
};

export const sendOrderStatusEmail = async (email, userName, orderId, newStatus, totalPrice) => {
  const template = orderStatusEmail(userName, orderId, newStatus, totalPrice);
  return sendEmail(email, template);
};

export const sendPasswordResetEmail = async (email, userName, resetToken) => {
  const template = passwordResetEmail(userName, resetToken);
  return sendEmail(email, template);
};
