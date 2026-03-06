
'use server';
/**
 * @fileOverview A server-side flow to generate a sacred 6-digit verification code (OTP) and send it in Hindi via Brevo.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { sendMail } from '@/lib/mail-service';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

// Robust singleton for server-side Firebase
function getDb() {
  if (getApps().length > 0) {
    return getFirestore(getApp());
  }
  const app = initializeApp(firebaseConfig);
  return getFirestore(app);
}

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
    const db = getDb();

    try {
      // 1. Check for duplicates in Firestore
      const subscribersRef = collection(db, "subscribers");
      
      const emailQ = query(subscribersRef, where("email", "==", cleanEmail), limit(1));
      const emailSnap = await getDocs(emailQ);
      if (!emailSnap.empty) {
        return { 
          success: false, 
          alreadyRegistered: true, 
          message: "Om Sai Ram. यह ईमेल पहले से ही पंजीकृत है।" 
        };
      }

      const phoneQ = query(subscribersRef, where("phone", "==", cleanPhone), limit(1));
      const phoneSnap = await getDocs(phoneQ);
      if (!phoneSnap.empty) {
        return { 
          success: false, 
          alreadyRegistered: true, 
          message: "Om Sai Ram. यह फोन नंबर पहले से ही पंजीकृत है।" 
        };
      }

      // 2. Generate 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      // 3. Generate message in Hindi
      const { text } = await ai.generate({
        prompt: `Generate a short, divine email message in Hindi (Devanagari script) for a devotee requesting a verification code. 
        The code is ${code}. 
        Guidelines:
        1. Start with 'Om Sai Ram'.
        2. Use ONLY Hindi (Devanagari script).
        3. Include the code ${code} clearly.`,
      });

      const finalMessage = text || `Om Sai Ram. आपका सत्यापन कोड ${code} है।`;

      // 4. Dispatch via Brevo
      const mailResult = await sendMail(
        cleanEmail,
        "Sai Parivar Ambala - Verification Code",
        finalMessage
      );

      return {
        code,
        message: finalMessage,
        success: mailResult.success,
        error: mailResult.error
      };
    } catch (err: any) {
      console.error('[SEND OTP FLOW ERROR]', err);
      return {
        success: false,
        message: "Om Sai Ram. Verification could not be initiated.",
        error: err.message
      };
    }
  }
);
