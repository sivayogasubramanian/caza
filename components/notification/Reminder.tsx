import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { firebaseCloudMessaging } from '../../utils/firebase/cloudMessaging';
import { getMessaging, onMessage } from 'firebase/messaging';
import { getApp } from 'firebase/app';
import { Button, notification } from 'antd';

function Reminder({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  useEffect(() => {
    setToken();

    // Event listener that listens for the push notification event in the background
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('event for the service worker', event);
      });
    }

    // Calls the getMessage() function if the token is there
    async function setToken() {
      try {
        const token = await firebaseCloudMessaging.init();
        if (token) {
          console.log('token', token);
          getMessage();
        }
      } catch (error) {
        console.log(error);
      }
    }
  });

  const handleClickPushNotification = (url: string | undefined) => {
    if (url) router.push(url);
  };

  function getMessage() {
    onMessage(getMessaging(getApp()), (message) => {
      notification.success({
        message: (
          <div>
            <h3>{message.notification?.title}</h3>
            <p>{message.notification?.body}</p>
          </div>
        ),
        btn: <Button onClick={() => handleClickPushNotification(message.data?.url)} />,
      });
    });
  }

  return <>{children}</>;
}

export default Reminder;
