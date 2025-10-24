import MessageCenter from '../features/notifications/MessageCenter';

interface MessagesPageProps {
  currentProfile?: any;
}

export default function MessagesPage({ currentProfile }: MessagesPageProps) {
  return <MessageCenter userProfile={currentProfile} />;
}