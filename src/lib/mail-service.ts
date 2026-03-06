
/**
 * @fileOverview A central service to handle real-world email dispatching via Brevo (Sendinblue).
 * This service is designed to be called ONLY from server-side contexts (Genkit Flows, Server Actions).
 */

export async function sendMail(to: string, subject: string, text: string) {
  let apiKey = process.env.BREVO_API_KEY;

  if (!apiKey) {
    console.error('[MAIL SERVICE] BREVO_API_KEY is missing from environment variables.');
    return { success: false, error: 'Mail service configuration missing' };
  }

  // Robustly handle the API key: trim whitespace and check if it's encoded (rare but handled)
  let finalKey = apiKey.trim();
  
  if (finalKey.startsWith('ey') && !finalKey.startsWith('xkeysib')) {
    try {
      const decodedString = Buffer.from(finalKey, 'base64').toString('utf8');
      const decodedJson = JSON.parse(decodedString);
      finalKey = (decodedJson.api_key || decodedJson.apiKey || finalKey).trim();
      console.log('[MAIL SERVICE] Decoded API Key from source');
    } catch (e) {
      // If it fails to decode, we use the original trimmed key
    }
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': finalKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: 'Sai Parivar Ambala',
          email: 'saibabatrustambala@gmail.com',
        },
        to: [
          {
            email: to,
          },
        ],
        subject: subject,
        textContent: text,
      }),
      signal: AbortSignal.timeout(10000) 
    });

    const result = await response.json();

    if (response.ok) {
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
    return { success: false, error: 'Could not connect to the email server. ' + error.message };
  }
}
