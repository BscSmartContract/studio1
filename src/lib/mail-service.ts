
import sgMail from '@sendgrid/mail';

/**
 * @fileOverview A central service to handle real-world email dispatching via SendGrid.
 */

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export async function sendMail(to: string, subject: string, text: string) {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('[MAIL SERVICE] SendGrid API Key missing. Skipping email send.');
    return { success: false, error: 'API Key missing' };
  }

  const msg = {
    to,
    from: 'saibabatrustambala@gmail.com', // MUST be a verified sender in SendGrid
    subject,
    text,
  };

  try {
    await sgMail.send(msg);
    return { success: true };
  } catch (error: any) {
    console.error('[MAIL SERVICE] Error sending email via SendGrid:', error);
    if (error.response) {
      console.error(error.response.body);
    }
    return { success: false, error: error.message };
  }
}
