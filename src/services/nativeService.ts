import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { PushNotifications } from '@capacitor/push-notifications';
import { api } from '../api';

export const isNative = Capacitor.isNativePlatform();

/**
 * Configure native mobile status bar to match Outly's dark-first obsidian aesthetic
 */
export async function initNativeStatusBar(): Promise<void> {
  if (!isNative) return;

  try {
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#08080A' });
  } catch (err) {
    console.warn('StatusBar initialization error:', err);
  }
}

/**
 * Request Push Notification permissions, register with FCM,
 * and sync the device token to Supabase for the Django backend to reach this device.
 */
export async function registerPushNotifications(
  userId: string,
  onOpenSquad?: (planId: string) => void
): Promise<string | null> {
  if (!isNative) {
    console.log('[Push] Running in Web environment — Push Notifications skipped');
    return null;
  }

  try {
    let permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== 'granted') {
      console.warn('[Push] Permission not granted:', permStatus.receive);
      return null;
    }

    // Register with Apple APNS / Google FCM
    await PushNotifications.register();

    // Listen for FCM registration token
    PushNotifications.addListener('registration', async (token) => {
      console.log('[Push] FCM Token received:', token.value);
      localStorage.setItem('outly_fcm_token', token.value);

      // Attempt to save token in user profile
      try {
        await api.updateProfile(userId, { fcm_token: token.value });
      } catch (e) {
        console.warn('[Push] Unable to update fcm_token in profiles table:', e);
      }
    });

    PushNotifications.addListener('registrationError', (err) => {
      console.error('[Push] FCM Registration Error:', err.error);
    });

    // Foreground push notifications
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('[Push] Notification received in foreground:', notification);
    });

    // User tapped on push notification banner
    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      console.log('[Push] Notification action performed:', action);
      const planId = action.notification.data?.planId || action.notification.data?.plan_id;
      if (planId && onOpenSquad) {
        onOpenSquad(planId);
      }
    });

    return localStorage.getItem('outly_fcm_token');
  } catch (error) {
    console.error('[Push] Failed to register notifications:', error);
    return null;
  }
}
