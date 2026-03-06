
/**
 * @fileOverview A central service to handle real-world email dispatching via Brevo (Sendinblue).
 */

export async function sendMail(to: string, subject: string, text: string) {
  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey) {
    console.warn('[MAIL SERVICE] Brevo API Key missing. Skipping email send.');
    return { success: false, error: 'API Key missing' };
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: 'Sai Parivar Ambala',
          email: 'saibabatrustambala@gmail.com', // MUST be a verified sender/domain in Brevo
        },
        to: [
          {
            email: to,
          },
        ],
        subject: subject,
        textContent: text,
      }),
    });

    if (response.ok) {
      return { success: true };
    } else {
      const errorData = await response.json();
      console.error('[MAIL SERVICE] Brevo API Error:', errorData);
      return { success: false, error: errorData.message || 'Failed to send email via Brevo' };
    }
  } catch (error: any) {
    console.error('[MAIL SERVICE] Connection Error:', error);
    return { success: false, error: error.message };
  }
}
