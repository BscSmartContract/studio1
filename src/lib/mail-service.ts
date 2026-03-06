
/**
 * @fileOverview A central service to handle real-world email dispatching via Brevo (Sendinblue).
 * This service is designed to be called ONLY from server-side contexts (Genkit Flows, Server Actions).
 */

export async function sendMail(to: string, subject: string, text: string) {
  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey) {
    console.error('[MAIL SERVICE] Brevo API Key is missing from environment variables.');
    return { success: false, error: 'API Key missing' };
  }

  try {
    console.log(`[MAIL SERVICE] Attempting to send divine email to: ${to}`);
    
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
          email: 'saibabatrustambala@gmail.com', // MUST be verified in Brevo Dashboard
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

    const result = await response.json();

    if (response.ok) {
      console.log('[MAIL SERVICE] Email dispatched successfully:', result.messageId || 'Success');
      return { success: true, messageId: result.messageId };
    } else {
      console.error('[MAIL SERVICE] Brevo API Error:', result);
      return { 
        success: false, 
        error: result.message || 'Failed to send email via Brevo',
        code: result.code 
      };
    }
  } catch (error: any) {
    console.error('[MAIL SERVICE] Connection Error:', error);
    return { success: false, error: error.message };
  }
}
