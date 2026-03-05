
'use server';
/**
 * @fileOverview A flow to generate and send spiritual confirmation emails to devotees via SendGrid.
 *
 * - sendConfirmationEmail - A function that drafts and sends a confirmation email.
 * - RegistrationEmailInput - The input type for the confirmation flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { sendMail } from '@/lib/mail-service';

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
 * Generates a confirmation email body and sends it via SendGrid.
 */
export async function sendConfirmationEmail(input: RegistrationEmailInput) {
  const { text } = await prompt(input);
  
  // Real dispatch via SendGrid
  const result = await sendMail(
    input.userEmail,
    "Sai Paduka Darshan - Registration Confirmation",
    text
  );
  
  return { 
    success: result.success, 
    message: result.success ? "Confirmation sent successfully." : "Failed to send email.",
    draftedContent: text 
  };
}
