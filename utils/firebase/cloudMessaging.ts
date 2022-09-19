import { getApp, getApps, initializeApp } from 'firebase/app';
import { getMessaging, getToken } from 'firebase/messaging';
import { useCallback } from 'react';

const firebaseCloudMessaging = {
  init: async () => {
    if (!getApps().length) {
      throw new Error('Did not initialize firebase.');
    }

    try {
      const messaging = getMessaging(getApp());

      // Request the push notification permission from browser
      const status = await Notification.requestPermission();
      if (status && status === 'granted') {
        // Get new token from Firebase
        const fcmToken = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_WEB_PUSH_CERTIFICATE,
        });

        return fcmToken;
      }

      return null;
    } catch (error) {
      console.error(error);
      return null;
    }
  },
};
export { firebaseCloudMessaging };
