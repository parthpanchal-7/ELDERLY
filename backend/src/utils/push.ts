import webpush from 'web-push';
import { ENV } from '../config/env.js';

let pushEnabled = false;

if (ENV.VAPID_PUBLIC_KEY && ENV.VAPID_PRIVATE_KEY) {
  try {
    webpush.setVapidDetails(
      ENV.VAPID_SUBJECT || 'mailto:parthpanchal1932@gmail.com',
      ENV.VAPID_PUBLIC_KEY,
      ENV.VAPID_PRIVATE_KEY
    );
    pushEnabled = true;
    console.log('✅ Web Push VAPID keys configured successfully');
  } catch (err: any) {
    console.warn(`[WebPush Init Warning] ${err.message}`);
  }
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  tag?: string;
}

export async function sendWebPush(
  subscription: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  },
  payload: PushNotificationPayload
): Promise<boolean> {
  if (!pushEnabled) {
    console.log('[WebPush Notice] VAPID keys not configured; skipped dispatch.');
    return false;
  }

  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: payload.title,
        body: payload.body,
        icon: payload.icon || '/icon-192.png',
        badge: payload.badge || '/badge-72.png',
        data: {
          url: payload.url || '/',
        },
        tag: payload.tag || 'general-reminder',
      })
    );
    return true;
  } catch (err: any) {
    console.warn(`[WebPush Error] Failed to send push notification: ${err.message}`);
    return false;
  }
}

export const isPushEnabled = () => pushEnabled;
