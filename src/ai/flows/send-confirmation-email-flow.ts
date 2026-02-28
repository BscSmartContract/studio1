'use server';
/**
 * @fileOverview A flow to generate and "send" spiritual confirmation emails to devotees.
 *
 * - sendConfirmationEmail - A function that drafts a confirmation email using Genkit.
 * - RegistrationEmailInput - The input type for the confirmation flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const RegistrationEmailInputSchema = z.object({
  userEmail: z.string().email().describe("The devotee's registered email address."),
  userName: z.string().describe("The name of the primary contact."),
  totalPeople: z.number().describe("Total number of people in the group."),
  devotees: z.array(z.object({
    name: z.string(),
    age: z.number()
  })).describe("List of all group members."),
  eventDate: z.string().describe("The date of the Sai Paduka event.")
});

export type RegistrationEmailInput = z.infer<typeof RegistrationEmailInputSchema>;

const prompt = ai.definePrompt({
  name: 'generateRegistrationEmail',
  input: { schema: RegistrationEmailInputSchema },
  prompt: `You are a warm and spiritual coordinator for the Sai Parivar Ambala team. 
A devotee has just registered for the Sai Paduka Darshan event.

Please draft a professional, warm, and divine email confirmation.

Devotee Information:
- Primary Contact: {{userName}}
- Total Group Size: {{totalPeople}}
- Event Date: {{eventDate}}

Group Members:
{{#each devotees}}
- {{name}} (Age: {{age}})
{{/each}}

Guidelines:
1. Start with the sacred greeting "Om Sai Ram".
2. Confirm that their registration is successful.
3. List the group details clearly so they have a record.
4. Include a blessing from Sai Parivar Ambala.
5. Remind them to arrive at Aggarwal Bhavan by 9:00 AM.
6. Keep the tone respectful, humble, and filled with Sai Baba's grace.

Draft the email body in plain text.`,
});

/**
 * Generates a confirmation email body and simulates the sending process.
 * In a production environment, this would integrate with an SMTP service or Email API.
 */
export async function sendConfirmationEmail(input: RegistrationEmailInput) {
  const { text } = await prompt(input);
  
  // For the prototype, we log the generated email to the console.
  // This demonstrates the AI logic and allows verification of the content.
  console.log(`\n--- [OUTGOING EMAIL SIMULATION] ---`);
  console.log(`TO: ${input.userEmail}`);
  console.log(`SUBJECT: Sai Paduka Darshan - Registration Confirmation`);
  console.log(`BODY:\n${text}`);
  console.log(`--- [END OF EMAIL] ---\n`);
  
  return { success: true, message: "Confirmation drafted and logged." };
}
