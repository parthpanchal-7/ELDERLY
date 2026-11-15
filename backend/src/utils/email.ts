import { Resend } from 'resend';
import nodemailer, { type Transporter } from 'nodemailer';
import { ENV } from '../config/env.js';

let resendClient: Resend | null = null;
if (ENV.RESEND_API_KEY && ENV.RESEND_API_KEY.startsWith('re_')) {
  resendClient = new Resend(ENV.RESEND_API_KEY);
}

let smtpTransporter: Transporter | null = null;
if (ENV.SMTP_HOST && ENV.SMTP_USER && ENV.SMTP_PASS) {
  try {
    smtpTransporter = nodemailer.createTransport({
      host: ENV.SMTP_HOST,
      port: ENV.SMTP_PORT || 587,
      secure: ENV.SMTP_PORT === 465,
      auth: {
        user: ENV.SMTP_USER,
        pass: ENV.SMTP_PASS.replace(/\s+/g, ''), // Strip spaces in Gmail app password if present
      },
    });
  } catch (err: any) {
    console.warn(`[SMTP Init Warning] ${err.message}`);
  }
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions): Promise<{ success: boolean; id?: string }> {
  const plainText = text || html.replace(/<[^>]+>/g, '');

  // 1. Try Gmail / Custom SMTP if configured
  if (smtpTransporter) {
    try {
      const info = await smtpTransporter.sendMail({
        from: ENV.EMAIL_FROM,
        to,
        subject,
        html,
        text: plainText,
      });
      console.log(`[Email] Successfully sent via SMTP (${ENV.SMTP_HOST}) to ${to} (MessageId: ${info.messageId})`);
      return { success: true, id: info.messageId };
    } catch (smtpErr: any) {
      console.warn(`[SMTP Warning] Could not deliver via SMTP: ${smtpErr.message}. Trying Resend fallback...`);
    }
  }

  // 2. Try Resend API
  if (resendClient) {
    try {
      const data = await resendClient.emails.send({
        from: ENV.EMAIL_FROM,
        to,
        subject,
        html,
        text: plainText,
      });
      console.log(`[Email] Sent via Resend to ${to} (ID: ${data.data?.id})`);
      return { success: true, id: data.data?.id };
    } catch (err: any) {
      console.error(`[Email Error] Failed sending via Resend to ${to}:`, err.message);
    }
  }

  // 3. Development fallback: clearly log email contents
  console.log(`\n================== [EMAIL DISPATCH LOG] ==================`);
  console.log(`TO: ${to}`);
  console.log(`SUBJECT: ${subject}`);
  console.log(`BODY:\n${plainText}`);
  console.log(`==========================================================\n`);
  return { success: true, id: `logged-${Date.now()}` };
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

export function buildEscalationEmail(
  patientName: string,
  recipientName: string,
  medName: string,
  scheduledTime: string
): { subject: string; html: string } {
  return {
    subject: `[Care Alert] Unconfirmed Dose for ${patientName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #FFF4E5; border-radius: 8px;">
        <h2 style="color: #D56A39; font-style: italic;">SaathiCare Care Circle Alert</h2>
        <p style="font-size: 18px; color: #193C47;">Dear <strong>${recipientName}</strong>,</p>
        <p style="font-size: 16px; color: #333;">A scheduled medication dose has passed without confirmation:</p>
        <div style="background: #ffffff; padding: 18px; border-left: 6px solid #D56A39; border-radius: 4px; margin: 16px 0;">
          <h3 style="margin: 0 0 8px 0; color: #D56A39;">${medName}</h3>
          <p style="margin: 0; color: #666; font-size: 16px;">Scheduled for: <strong>${scheduledTime}</strong></p>
          <p style="margin: 4px 0 0 0; color: #888; font-size: 14px;">Patient: ${patientName}</p>
        </div>
        <p style="font-size: 14px; color: #666;">You may want to gently check in with ${patientName} to ensure everything is okay.</p>
        <p style="font-size: 12px; color: #999; margin-top: 32px; border-top: 1px solid #ddd; padding-top: 12px;">SaathiCare — Care that feels close to home.</p>
      </div>
    `,
  };
}

export function buildInvitationEmail(
  inviterName: string,
  patientName: string,
  passcode: string,
  role: string
): { subject: string; html: string } {
  return {
    subject: `SaathiCare: Invitation from ${inviterName} to join ${patientName}'s Care Circle`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #F9F7F1; border-radius: 8px;">
        <h2 style="color: #193C47; font-style: italic;">SaathiCare</h2>
        <p style="font-size: 18px; color: #193C47;">Hello,</p>
        <p style="font-size: 16px; color: #333;"><strong>${inviterName}</strong> has invited you to join the Care Circle for <strong>${patientName}</strong> as a <strong>${role}</strong>.</p>
        <p style="font-size: 16px; color: #333;">Your 6-digit access verification passcode is:</p>
        <div style="background: #E6F5EF; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <span style="font-size: 36px; font-weight: bold; letter-spacing: 6px; color: #147D75;">${passcode}</span>
        </div>
        <p style="font-size: 14px; color: #666;">This passcode is valid for 7 days. Sign in to your SaathiCare account and enter this passcode to join.</p>
        <p style="font-size: 12px; color: #999; margin-top: 32px; border-top: 1px solid #ddd; padding-top: 12px;">SaathiCare — Care that feels close to home.</p>
      </div>
    `,
  };
}
