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

  // Handle the Base64 encoded JSON key if provided (common in some deployment flows)
  if (apiKey.startsWith('ey') || apiKey.includes('{')) {
    try {
      let decodedString = apiKey;
      if (apiKey.startsWith('ey')) {
        decodedString = Buffer.from(apiKey, 'base64').toString('utf8');
      }
      
      const decodedJson = JSON.parse(decodedString);
      apiKey = decodedJson.api_key || decodedJson.apiKey || apiKey;
      console.log('[MAIL SERVICE] Successfully parsed API Key from encoded source');
    } catch (e) {
      console.warn('[MAIL SERVICE] Using raw BREVO_API_KEY value');
    }
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey.trim(),
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
      // Set a strict timeout to avoid hanging the server action
      signal: AbortSignal.timeout(9000) 
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
