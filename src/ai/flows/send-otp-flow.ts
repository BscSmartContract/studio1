
'use server';
/**
 * @fileOverview A flow to generate a sacred 6-digit verification code (OTP) for devotees.
 *
 * - sendOtp - Generates a code and simulates sending it via email.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SendOtpInputSchema = z.object({
  email: z.string().email().describe("The devotee's email address.")
});
export type SendOtpInput = z.infer<typeof SendOtpInputSchema>;

const SendOtpOutputSchema = z.object({
  code: z.string().describe("The generated 6-digit code."),
  message: z.string().describe("Simulated delivery status.")
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
    
    // Simulate a sacred tone for the message
    const { text } = await ai.generate({
      prompt: `A devotee with email ${input.email} is requesting a verification code. 
      The code is ${code}. 
      Generate a short, 1-sentence divine confirmation message in English starting with 'Om Sai Ram'.`,
    });

    console.log(`\n--- [OTP DELIVERY SIMULATION] ---`);
    console.log(`TO: ${input.email}`);
    console.log(`YOUR SACRED CODE: ${code}`);
    console.log(`MESSAGE: ${text}`);
    console.log(`--- [END OF SIMULATION] ---\n`);

    return {
      code,
      message: text || `Om Sai Ram. Your verification code is ${code}.`
    };
  }
);
