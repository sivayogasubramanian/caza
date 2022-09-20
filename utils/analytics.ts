import { getAnalytics, logEvent } from 'firebase/analytics';

export default function ga(event: string) {
  const analytics = getAnalytics();
  logEvent(analytics, event);
}
