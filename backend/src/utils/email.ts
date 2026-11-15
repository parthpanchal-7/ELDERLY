import { Resend } from 'resend';
import { ENV } from '../config/env.js';

let resendClient: Resend | null = null;
if (ENV.RESEND_API_KEY && ENV.RESEND_API_KEY.startsWith('re_')) {
  resendClient = new Resend(ENV.RESEND_API_KEY);
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions): Promise<{ success: boolean; id?: string }> {
  if (resendClient) {
    try {
      const data = await resendClient.emails.send({
        from: ENV.EMAIL_FROM,
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]+>/g, ''),
      });
      console.log(`[Email] Sent via Resend to ${to} (ID: ${data.data?.id})`);
      return { success: true, id: data.data?.id };
    } catch (err: any) {
      console.error(`[Email Error] Failed sending to ${to}:`, err.message);
      return { success: false };
    }
  } else {
    // Development fallback: clearly log email contents
    console.log(`\n================== [DEV EMAIL SINK] ==================`);
    console.log(`TO: ${to}`);
    console.log(`SUBJECT: ${subject}`);
    console.log(`BODY:\n${text || html.replace(/<[^>]+>/g, '')}`);
    console.log(`======================================================\n`);
    return { success: true, id: `dev-${Date.now()}` };
  }
}

export function buildDoseReminderEmail(patientName: string, medName: string, scheduledTime: string): { subject: string; html: string } {
  return {
    subject: `SaathiCare Reminder: Time for ${medName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #F9F7F1; border-radius: 8px;">
        <h2 style="color: #193C47; font-style: italic;">SaathiCare</h2>
        <p style="font-size: 18px; color: #193C47;">Hello <strong>${patientName}</strong>,</p>
        <p style="font-size: 16px; color: #333;">This is your care reminder for today:</p>
        <div style="background: #ffffff; padding: 18px; border-left: 6px solid #147D75; border-radius: 4px; margin: 16px 0;">
          <h3 style="margin: 0 0 8px 0; color: #147D75;">${medName}</h3>
          <p style="margin: 0; color: #666; font-size: 16px;">Scheduled for: <strong>${scheduledTime}</strong></p>
        </div>
        <p style="font-size: 14px; color: #666;">Please check into your SaathiCare dashboard to mark this dose as taken.</p>
        <p style="font-size: 12px; color: #999; margin-top: 32px; border-top: 1px solid #ddd; padding-top: 12px;">SaathiCare — Care that feels close to home.</p>
      </div>
    `,
  };
}

export function buildEscalationEmail(elderlyName: string, familyName: string, medName: string, dueTime: string): { subject: string; html: string } {
  return {
    subject: `SaathiCare Alert: Unconfirmed dose for ${elderlyName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #F9F7F1; border-radius: 8px;">
        <h2 style="color: #193C47; font-style: italic;">SaathiCare — Care Circle Alert</h2>
        <p style="font-size: 18px; color: #193C47;">Hello <strong>${familyName}</strong>,</p>
        <p style="font-size: 16px; color: #333;">
          A scheduled dose for <strong>${elderlyName}</strong> has not yet been confirmed:
        </p>
        <div style="background: #ffffff; padding: 18px; border-left: 6px solid #D56A39; border-radius: 4px; margin: 16px 0;">
          <h3 style="margin: 0 0 8px 0; color: #D56A39;">${medName}</h3>
          <p style="margin: 0; color: #666;">Scheduled Time: <strong>${dueTime}</strong></p>
          <p style="margin: 6px 0 0 0; color: #888; font-size: 14px;">Status: Unconfirmed past grace period</p>
        </div>
        <p style="font-size: 15px; color: #444;">Please check in with ${elderlyName} to verify their well-being.</p>
        <p style="font-size: 12px; color: #999; margin-top: 32px; border-top: 1px solid #ddd; padding-top: 12px;">SaathiCare — Care that feels close to home.</p>
      </div>
    `,
  };
}

export function buildInvitationEmail(inviterName: string, elderlyName: string, passcode: string, role: string): { subject: string; html: string } {
  return {
    subject: `SaathiCare: Invitation to join ${elderlyName}'s Care Circle`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #F9F7F1; border-radius: 8px;">
        <h2 style="color: #193C47; font-style: italic;">SaathiCare</h2>
        <p style="font-size: 18px; color: #193C47;">You have been invited!</p>
        <p style="font-size: 16px; color: #333;">
          <strong>${inviterName}</strong> has invited you to join the Care Circle for <strong>${elderlyName}</strong> as a <strong>${role === 'caregiver' ? 'Caregiver' : 'Family Member'}</strong>.
        </p>
        <div style="background: #E6F5EF; padding: 20px; border-radius: 8px; text-align: center; margin: 24px 0;">
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #147D75; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">Your One-Time Passcode</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #193C47;">${passcode}</div>
          <p style="margin: 8px 0 0 0; font-size: 12px; color: #666;">This passcode expires in 24 hours.</p>
        </div>
        <p style="font-size: 14px; color: #555;">Log in or create an account at SaathiCare and enter this passcode to join.</p>
        <p style="font-size: 12px; color: #999; margin-top: 32px; border-top: 1px solid #ddd; padding-top: 12px;">SaathiCare — Care that feels close to home.</p>
      </div>
    `,
  };
}
