
'use server';
/**
 * @fileOverview A flow to generate a sacred 6-digit verification code (OTP) and send it via SendGrid.
 *
 * - sendOtp - Generates a code and sends it via SendGrid.
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
  message: z.string().describe("Simulated or actual delivery status.")
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
    
    // Generate a divine message for the email
    const { text } = await ai.generate({
      prompt: `Generate a short, divine email message for a devotee requesting a verification code. 
      The code is ${code}. 
      The message should start with 'Om Sai Ram' and be filled with grace.
      Email should be in English.`,
    });

    const finalMessage = text || `Om Sai Ram. Your sacred verification code for upcoming Sai events is ${code}.`;

    // Real dispatch via SendGrid
    await sendMail(
      input.email,
      "Sai Parivar Ambala - Sacred Verification Code",
      finalMessage
    );

    return {
      code,
      message: finalMessage
    };
  }
);
