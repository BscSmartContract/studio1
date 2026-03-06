'use server';
/**
 * @fileOverview A flow to generate a sacred 6-digit verification code (OTP) and send it in Hindi via Brevo.
 *
 * - sendOtp - Generates a code and sends it via Brevo.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { sendMail } from '@/lib/mail-service';

const SendOtpInputSchema = z.object({
  email: z.string().email().describe("The devotee's email address.")
});
export type SendOtpInput = z.infer<typeof SendOtpInputSchema>;

const SendOtpOutputSchema = z.object({
  code: z.string().describe("The generated 6-digit code."),
  message: z.string().describe("The divine message body."),
  success: z.boolean().describe("Whether the email was dispatched."),
  error: z.string().optional().describe("Error message if delivery failed.")
});
export type SendOtpOutput = z.infer<typeof SendOtpOutputSchema>;

export async function sendOtp(input: SendOtpInput): Promise<SendOtpOutput> {
  return sendOtpFlow(input);
}

const sendOtpFlow = ai.defineFlow(
  {
    name: 'sendOtpFlow',
    inputSchema: SendOtpInputSchema,
    outputSchema: SendOtpOutputSchema,
  },
  async (input) => {
    // Generate a simple 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Generate a divine message for the email in Hindi
    const { text } = await ai.generate({
      prompt: `Generate a short, divine email message in Hindi (Devanagari script) for a devotee requesting a verification code. 
      The code is ${code}. 
      Guidelines:
      1. Start with 'Om Sai Ram'.
      2. Use ONLY Hindi (Devanagari script).
      3. The message should be filled with grace and spiritual warmth.
      4. Clearly include the verification code ${code}.
      5. Keep the message concise.`,
    });

    const finalMessage = text || `Om Sai Ram. आगामी साईं आयोजनों के लिए आपका पावन सत्यापन कोड ${code} है। बाबा की कृपा आप पर बनी रहे।`;

    // Real dispatch via Brevo
    const mailResult = await sendMail(
      input.email,
      "Sai Parivar Ambala - Sacred Verification Code",
      finalMessage
    );

    return {
      code,
      message: finalMessage,
      success: mailResult.success,
      error: mailResult.error
    };
  }
);
