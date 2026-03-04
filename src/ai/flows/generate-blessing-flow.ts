'use server';
/**
 * @fileOverview A flow to generate spiritual blessings and teachings from Shirdi Sai Baba in Hindi.
 *
 * - generateBlessing - A function that calls the AI to create a divine message.
 * - GenerateBlessingInput - Empty input schema.
 * - GenerateBlessingOutput - The generated Hindi string.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateBlessingInputSchema = z.object({});
export type GenerateBlessingInput = z.infer<typeof GenerateBlessingInputSchema>;

const GenerateBlessingOutputSchema = z.string();
export type GenerateBlessingOutput = z.infer<typeof GenerateBlessingOutputSchema>;

export async function generateBlessing(input: GenerateBlessingInput): Promise<GenerateBlessingOutput> {
  return generateBlessingFlow(input);
}

const generateBlessingFlow = ai.defineFlow(
  {
    name: 'generateBlessingFlow',
    inputSchema: GenerateBlessingInputSchema,
    outputSchema: GenerateBlessingOutputSchema,
  },
  async () => {
    const { text } = await ai.generate({
      prompt: `Generate a profound and spiritual teaching or blessing from Shirdi Sai Baba in Hindi. 
      The tone should be calm, divine, and encouraging. 
      Focus on themes like Shraddha (Faith), Saburi (Patience), or the presence of Baba in every soul. 
      
      Guidelines:
      1. Use ONLY Hindi (Devanagari script).
      2. Keep it concise (maximum 1-2 sentences).
      3. Do NOT include any English translations or extra commentary.
      4. Ensure it sounds like an authentic teaching (e.g., using "मेरे बच्चे", "चिंता मत करो").`,
    });
    
    return text || "श्रद्धा और सबुरी। तुम्हारा विश्वास तुम्हें मेरे द्वार तक लाएगा।";
  }
);
