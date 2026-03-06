
'use server';
/**
 * @fileOverview A server-side flow to generate a sacred 6-digit verification code (OTP) and send it in Hindi via Brevo.
 * This flow executes strictly on the server, keeping the API keys secure.
 *
 * - sendOtp - Checks for duplicates, generates a code, and sends it via Brevo.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { sendMail } from '@/lib/mail-service';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, limit } from 'firebase/firestore';
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

    try {
      // 1. Check for duplicates in Firestore (Administrative Check)
      const subscribersRef = collection(db, "subscribers");
      
      // Check Email
      const emailQ = query(subscribersRef, where("email", "==", cleanEmail), limit(1));
      const emailSnap = await getDocs(emailQ);
      if (!emailSnap.empty) {
        return { 
          success: false, 
          alreadyRegistered: true, 
          message: "Om Sai Ram. यह ईमेल पहले से ही पंजीकृत है।" 
        };
      }

      // Check Phone
      const phoneQ = query(subscribersRef, where("phone", "==", cleanPhone), limit(1));
      const phoneSnap = await getDocs(phoneQ);
      if (!phoneSnap.empty) {
        return { 
          success: false, 
          alreadyRegistered: true, 
          message: "Om Sai Ram. यह फोन नंबर पहले से ही पंजीकृत है।" 
        };
      }

      // 2. Generate a simple 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      // 3. Generate a divine message for the email in Hindi
      const { text } = await ai.generate({
        prompt: `Generate a short, divine email message in Hindi (Devanagari script) for a devotee requesting a verification code for upcoming event alerts. 
        The code is ${code}. 
        Guidelines:
        1. Start with 'Om Sai Ram'.
        2. Use ONLY Hindi (Devanagari script).
        3. The tone should be filled with grace and spiritual warmth.
        4. Clearly include the verification code ${code}.
        5. Mention that Baba is always with them.
        6. Keep the message concise.`,
      });

      const finalMessage = text || `Om Sai Ram. आगामी साईं आयोजनों के लिए आपका पावन सत्यापन कोड ${code} है। बाबा की कृपा आप पर बनी रहे।`;

      // 4. Real dispatch via Brevo (Strictly Server-Side)
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
    } catch (err: any) {
      console.error("sendOtpFlow error:", err);
      return {
        success: false,
        message: "Om Sai Ram. Verification could not be initiated.",
        error: err.message
      };
    }
  }
);
