import { useState } from 'react';
import { Send, Paperclip, Search, Plus, MoreVertical, Archive, Trash2, MessageSquare, User, Users } from 'lucide-react';
import { getRelativeTime } from '../../lib/notifications';
// Mock data removed - use real API data
import type { MessageThread, Message } from '../../types';

interface MessageCenterProps {
  userProfile: any;
}

export default function MessageCenter({ userProfile }: MessageCenterProps) {
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);

  // TODO: Replace with real API calls
  const threads: any[] = [];
  const filteredThreads = threads.filter(thread => 
    searchTerm === '' || 
    thread.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    thread.lastMessagePreview.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentThread = selectedThread ? threads.find(t => t.id === selectedThread) : null;
  const messages: any[] = [];

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedThread) return;
    
    console.log('Sending message:', {
      threadId: selectedThread,
      content: newMessage,
      senderId: userProfile?.id
    });
    
    setNewMessage('');
    // In real app, this would call an API to send the message
  };

  const handleNewConversation = () => {
    setShowNewMessageModal(true);
  };

  const handleArchiveThread = (threadId: string) => {
    console.log('Archiving thread:', threadId);
    // In real app, this would call an API
  };

  const handleDeleteThread = (threadId: string) => {
    console.log('Deleting thread:', threadId);
    // In real app, this would call an API
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Message Center</h1>
            <p className="text-gray-600">
              Communicate with teachers, administrators, and other families
            </p>
          </div>
          <button
            onClick={handleNewConversation}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Message
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden" style={{ height: '70vh' }}>
        <div className="flex h-full">
          {/* Thread List Sidebar */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search conversations..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            {/* Thread List */}
            <div className="flex-1 overflow-y-auto">
              {filteredThreads.length > 0 ? (
                filteredThreads.map((thread) => (
                  <ThreadListItem
                    key={thread.id}
                    thread={thread}
                    isSelected={selectedThread === thread.id}
                    currentUserId={userProfile?.id}
                    onSelect={() => setSelectedThread(thread.id)}
                    onArchive={() => handleArchiveThread(thread.id)}
                    onDelete={() => handleDeleteThread(thread.id)}
                  />
                ))
              ) : (
                <div className="p-8 text-center">
                  <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No conversations</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm ? 'No conversations match your search.' : 'Start a new conversation to get started.'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Message View */}
          <div className="flex-1 flex flex-col">
            {selectedThread && currentThread ? (
              <>
                {/* Thread Header */}
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{currentThread.subject}</h3>
                      <p className="text-sm text-gray-500">
                        {currentThread.participants.length} participants • {currentThread.threadType}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleArchiveThread(currentThread.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                        title="Archive conversation"
                      >
                        <Archive className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteThread(currentThread.id)}
                        className="p-2 text-gray-400 hover:text-red-600 rounded-md hover:bg-gray-100"
                        title="Delete conversation"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.length > 0 ? (
                    messages.map((message) => (
                      <MessageItem
                        key={message.id}
                        message={message}
                        isCurrentUser={message.senderId === userProfile?.id}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-500">No messages in this conversation yet.</p>
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <div className="border-t border-gray-200 px-6 py-4">
                  <div className="flex items-end space-x-3">
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100">
                      <Paperclip className="h-5 w-5" />
                    </button>
                    <div className="flex-1">
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        rows={3}
                        className="block w-full border border-gray-300 rounded-md shadow-sm placeholder-gray-500 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm resize-none"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                      />
                    </div>
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Press Enter to send, Shift+Enter for new line
                  </p>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="mx-auto h-16 w-16 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">Select a conversation</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Choose a conversation from the sidebar to start messaging.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Message Modal */}
      {showNewMessageModal && (
        <NewMessageModal
          userProfile={userProfile}
          onClose={() => setShowNewMessageModal(false)}
          onSend={(data) => {
            console.log('Creating new conversation:', data);
            setShowNewMessageModal(false);
            // In real app, this would create a new thread and select it
          }}
        />
      )}
    </div>
  );
}

// Thread List Item Component
function ThreadListItem({
  thread,
  isSelected,
  currentUserId,
  onSelect
}: {
  thread: MessageThread;
  isSelected: boolean;
  currentUserId: string;
  onSelect: () => void;
  onArchive: () => void;
  onDelete: () => void;
}) {
  const unreadCount = thread.unreadCount[currentUserId] || 0;
  const hasUnread = unreadCount > 0;

  return (
    <div
      onClick={onSelect}
      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
        isSelected ? 'bg-indigo-50 border-indigo-200' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1 min-w-0">
          <div className="flex-shrink-0">
            {thread.threadType === 'direct' ? (
              <User className="h-5 w-5 text-gray-400" />
            ) : (
              <Users className="h-5 w-5 text-gray-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className={`text-sm font-medium truncate ${hasUnread ? 'text-gray-900' : 'text-gray-700'}`}>
                {thread.subject}
              </h4>
              {hasUnread && (
                <span className="bg-indigo-100 text-indigo-800 py-0.5 px-2 rounded-full text-xs font-medium">
                  {unreadCount}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 truncate mb-1">{thread.lastMessagePreview}</p>
            <p className="text-xs text-gray-400">{getRelativeTime(thread.lastMessageAt)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Message Item Component
function MessageItem({
  message,
  isCurrentUser
}: {
  message: Message;
  isCurrentUser: boolean;
}) {
  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
        isCurrentUser 
          ? 'bg-indigo-600 text-white' 
          : 'bg-gray-100 text-gray-900'
      }`}>
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        <p className={`text-xs mt-1 ${
          isCurrentUser ? 'text-indigo-100' : 'text-gray-500'
        }`}>
          {message.sentAt ? getRelativeTime(message.sentAt) : 'Sending...'}
        </p>
      </div>
    </div>
  );
}

// New Message Modal Component
function NewMessageModal({
  onClose,
  onSend
}: {
  userProfile: any;
  onClose: () => void;
  onSend: (data: { recipients: string[]; subject: string; message: string }) => void;
}) {
  const [recipients, setRecipients] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (!recipients.trim() || !subject.trim() || !message.trim()) return;
    
    onSend({
      recipients: recipients.split(',').map(r => r.trim()),
      subject: subject.trim(),
      message: message.trim()
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">New Message</h3>
        </div>
        
        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To (comma-separated)
            </label>
            <input
              type="text"
              value={recipients}
              onChange={(e) => setRecipients(e.target.value)}
              placeholder="teacher-1, admin-1"
              className="block w-full border border-gray-300 rounded-md shadow-sm placeholder-gray-500 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Message subject"
              className="block w-full border border-gray-300 rounded-md shadow-sm placeholder-gray-500 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              placeholder="Type your message..."
              className="block w-full border border-gray-300 rounded-md shadow-sm placeholder-gray-500 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>
        
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={!recipients.trim() || !subject.trim() || !message.trim()}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Send Message
          </button>
        </div>
      </div>
    </div>
  );
}