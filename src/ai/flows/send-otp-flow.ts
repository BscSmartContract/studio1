
'use server';
/**
 * @fileOverview A flow to generate a sacred 6-digit verification code (OTP) and send it in Hindi via Brevo.
 * It also checks if the devotee is already registered to prevent duplicates.
 *
 * - sendOtp - Checks for duplicates, generates a code, and sends it via Brevo.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { sendMail } from '@/lib/mail-service';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

// Initialize Firebase for server-side Firestore access within the flow
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

const SendOtpInputSchema = z.object({
  email: z.string().email().describe("The devotee's email address."),
  phone: z.string().describe("The devotee's phone number.")
});
export type SendOtpInput = z.infer<typeof SendOtpInputSchema>;

const SendOtpOutputSchema = z.object({
  code: z.string().optional().describe("The generated 6-digit code."),
  message: z.string().describe("The divine message body or error message."),
  success: z.boolean().describe("Whether the flow was successful."),
  alreadyRegistered: z.boolean().optional().describe("True if the user is already in the system."),
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
    const cleanEmail = input.email.trim().toLowerCase();
    const cleanPhone = input.phone.trim();

    // 1. Check for duplicates in Firestore (Server-side bypasses security rules)
    const subscribersRef = collection(db, "subscribers");
    
    // Check Email
    const emailQ = query(subscribersRef, where("email", "==", cleanEmail));
    const emailSnap = await getDocs(emailQ);
    if (!emailSnap.empty) {
      return { 
        success: false, 
        alreadyRegistered: true, 
        message: "Om Sai Ram. This email is already registered for upcoming event updates." 
      };
    }

    // Check Phone
    const phoneQ = query(subscribersRef, where("phone", "==", cleanPhone));
    const phoneSnap = await getDocs(phoneQ);
    if (!phoneSnap.empty) {
      return { 
        success: false, 
        alreadyRegistered: true, 
        message: "Om Sai Ram. This phone number is already registered for upcoming event updates." 
      };
    }

    // 2. Generate a simple 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // 3. Generate a divine message for the email in Hindi
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

    // 4. Real dispatch via Brevo
    const mailResult = await sendMail(
      cleanEmail,
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
