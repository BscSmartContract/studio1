
/**
 * @fileOverview A central service to handle real-world email dispatching via Brevo (Sendinblue).
 * This service is designed to be called ONLY from server-side contexts (Genkit Flows, Server Actions).
 */

export async function sendMail(to: string, subject: string, text: string) {
  let apiKey = process.env.BREVO_API_KEY;

  // Handle the Base64 encoded JSON key if provided
  if (apiKey && apiKey.startsWith('ey')) {
    try {
      const decoded = JSON.parse(Buffer.from(apiKey, 'base64').toString());
      apiKey = decoded.api_key;
    } catch (e) {
      console.error('[MAIL SERVICE] Failed to decode Brevo API Key from Base64');
    }
  }

  if (!apiKey) {
    console.error('[MAIL SERVICE] Brevo API Key is missing or invalid.');
    return { success: false, error: 'API Key missing or invalid' };
  }

  try {
    console.log(`[MAIL SERVICE] Attempting to send divine email to: ${to}`);
    
    // Add a timeout to the fetch request to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

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
      signal: controller.signal
    });

    clearTimeout(timeoutId);
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
    if (error.name === 'AbortError') {
      console.error('[MAIL SERVICE] Request timed out');
      return { success: false, error: 'Request timed out' };
    }
    console.error('[MAIL SERVICE] Connection Error:', error);
    return { success: false, error: error.message };
  }
}
