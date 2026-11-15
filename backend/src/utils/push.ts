import { ENV } from '../config/env.js';

let pushClient: any = null;
let pushInitAttempted = false;

async function getWebPushClient() {
  if (pushClient) return pushClient;
  if (pushInitAttempted) return null;
  pushInitAttempted = true;

  if (ENV.VAPID_PUBLIC_KEY && ENV.VAPID_PRIVATE_KEY) {
    try {
      const mod = await import('web-push');
      const webpush = (mod as any).default || mod;
      webpush.setVapidDetails(
        ENV.VAPID_SUBJECT || 'mailto:parthpanchal1932@gmail.com',
        ENV.VAPID_PUBLIC_KEY,
        ENV.VAPID_PRIVATE_KEY
      );
      pushClient = webpush;
      console.log('✅ Web Push VAPID configured successfully');
      return pushClient;
    } catch (err: any) {
      console.warn(`[WebPush Init Warning] ${err.message}`);
      return null;
    }
  }
  return null;
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
  const client = await getWebPushClient();
  if (!client) {
    return false;
  }

  try {
    await client.sendNotification(
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

export const isPushEnabled = () => !!(ENV.VAPID_PUBLIC_KEY && ENV.VAPID_PRIVATE_KEY);
