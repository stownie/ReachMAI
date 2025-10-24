import NotificationCenter from '../features/notifications/NotificationCenter';

interface NotificationsPageProps {
  currentProfile?: any;
}

export default function NotificationsPage({ currentProfile }: NotificationsPageProps) {
  return <NotificationCenter userProfile={currentProfile} />;
}