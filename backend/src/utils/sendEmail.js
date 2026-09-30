import { env } from '../config/env.js';

export const sendResetEmail = async ({ toEmail, toName, resetLink }) => {
  const { serviceId, templateId, publicKey, privateKey } = env.emailjs;
  if (!serviceId || !templateId || !publicKey || !privateKey) {
    throw new Error('EmailJS env variables missing');
  }

  const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      accessToken: privateKey,
      template_params: { email: toEmail, to_name: toName, link: resetLink },
    }),
  });

  if (!res.ok) throw new Error(`EmailJS failed: ${res.status} ${await res.text()}`);
};