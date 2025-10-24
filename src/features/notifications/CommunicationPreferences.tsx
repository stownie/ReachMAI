import { useState } from 'react';
import { Save, Bell, Mail, Smartphone, Clock, Shield, Plus, Trash2, Edit } from 'lucide-react';
import type { UserCommunicationPreferences, NotificationCategory, EmergencyContact } from '../../types';

interface CommunicationPreferencesProps {
  userProfile: any;
}

export default function CommunicationPreferences({ userProfile }: CommunicationPreferencesProps) {
  // Mock current preferences - in real app, this would come from API
  const [preferences, setPreferences] = useState<UserCommunicationPreferences>({
    id: 'prefs-1',
    userId: userProfile?.id || 'user-1',
    profileId: userProfile?.id,
    emailPreferences: {
      enabled: true,
      emailAddress: 'sarah.johnson@email.com',
      categories: {
        billing: true,
        enrollment: true,
        scheduling: true,
        attendance: true,
        assignments: true,
        system: false,
        messages: true,
        announcements: true
      },
      format: 'html',
      frequency: 'immediate',
      unsubscribeAll: false
    },
    smsPreferences: {
      enabled: true,
      phoneNumber: '+1 (555) 123-4567',
      categories: {
        billing: true,
        enrollment: false,
        scheduling: true,
        attendance: true,
        assignments: false,
        system: false,
        messages: false,
        announcements: false
      },
      urgencyThreshold: 'high',
      carrierOptIn: true
    },
    pushPreferences: {
      enabled: true,
      deviceTokens: ['device-token-1'],
      categories: {
        billing: true,
        enrollment: true,
        scheduling: true,
        attendance: true,
        assignments: true,
        system: true,
        messages: true,
        announcements: true
      },
      soundEnabled: true,
      badgeEnabled: true
    },
    digestSettings: {
      enabled: true,
      frequency: 'daily',
      deliveryTime: '08:00',
      deliveryDay: 'monday',
      includeCategories: ['billing', 'enrollment', 'scheduling', 'assignments']
    },
    quietHours: {
      enabled: true,
      startTime: '22:00',
      endTime: '07:00',
      timezone: 'America/New_York',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    emergencyContacts: [
      {
        id: 'contact-1',
        name: 'John Johnson',
        relationship: 'Spouse',
        phoneNumber: '+1 (555) 987-6543',
        emailAddress: 'john.johnson@email.com',
        isPrimary: true,
        receiveAlerts: true
      }
    ],
    languagePreference: 'en',
    timezone: 'America/New_York',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  const [showEmergencyContactModal, setShowEmergencyContactModal] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);

  const categories: { key: NotificationCategory; label: string; description: string }[] = [
    { key: 'billing', label: 'Billing & Payments', description: 'Invoice reminders, payment confirmations' },
    { key: 'enrollment', label: 'Enrollment', description: 'Registration updates, waitlist notifications' },
    { key: 'scheduling', label: 'Scheduling', description: 'Class changes, cancellations, reminders' },
    { key: 'attendance', label: 'Attendance', description: 'Attendance alerts and reports' },
    { key: 'assignments', label: 'Assignments', description: 'Homework reminders, grades posted' },
    { key: 'system', label: 'System Updates', description: 'Platform updates, maintenance notices' },
    { key: 'messages', label: 'Messages', description: 'Direct messages from teachers and staff' },
    { key: 'announcements', label: 'Announcements', description: 'School-wide announcements and news' }
  ];

  const handleSave = () => {
    console.log('Saving preferences:', preferences);
    // In real app, this would call an API to save preferences
  };

  const updateEmailCategory = (category: NotificationCategory, enabled: boolean) => {
    setPreferences(prev => ({
      ...prev,
      emailPreferences: {
        ...prev.emailPreferences,
        categories: {
          ...prev.emailPreferences.categories,
          [category]: enabled
        }
      }
    }));
  };

  const updateSmsCategory = (category: NotificationCategory, enabled: boolean) => {
    setPreferences(prev => ({
      ...prev,
      smsPreferences: {
        ...prev.smsPreferences,
        categories: {
          ...prev.smsPreferences.categories,
          [category]: enabled
        }
      }
    }));
  };

  const updatePushCategory = (category: NotificationCategory, enabled: boolean) => {
    setPreferences(prev => ({
      ...prev,
      pushPreferences: {
        ...prev.pushPreferences,
        categories: {
          ...prev.pushPreferences.categories,
          [category]: enabled
        }
      }
    }));
  };

  const addEmergencyContact = (contact: Omit<EmergencyContact, 'id'>) => {
    const newContact: EmergencyContact = {
      ...contact,
      id: `contact-${Date.now()}`
    };
    
    setPreferences(prev => ({
      ...prev,
      emergencyContacts: [...prev.emergencyContacts, newContact]
    }));
  };

  const updateEmergencyContact = (contactId: string, updatedContact: Partial<EmergencyContact>) => {
    setPreferences(prev => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.map(contact =>
        contact.id === contactId ? { ...contact, ...updatedContact } : contact
      )
    }));
  };

  const removeEmergencyContact = (contactId: string) => {
    setPreferences(prev => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.filter(contact => contact.id !== contactId)
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Communication Preferences</h1>
            <p className="text-gray-600">
              Manage how and when you receive notifications and communications
            </p>
          </div>
          <button
            onClick={handleSave}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {/* Email Preferences */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <Mail className="h-5 w-5 text-gray-400 mr-3" />
              <h3 className="text-lg font-medium text-gray-900">Email Notifications</h3>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferences.emailPreferences.enabled}
                    onChange={(e) => setPreferences(prev => ({
                      ...prev,
                      emailPreferences: { ...prev.emailPreferences, enabled: e.target.checked }
                    }))}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-900">Enable email notifications</span>
                </label>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={preferences.emailPreferences.emailAddress}
                    onChange={(e) => setPreferences(prev => ({
                      ...prev,
                      emailPreferences: { ...prev.emailPreferences, emailAddress: e.target.value }
                    }))}
                    className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Format
                  </label>
                  <select
                    value={preferences.emailPreferences.format}
                    onChange={(e) => setPreferences(prev => ({
                      ...prev,
                      emailPreferences: { ...prev.emailPreferences, format: e.target.value as 'html' | 'text' }
                    }))}
                    className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="html">HTML (Rich formatting)</option>
                    <option value="text">Plain Text</option>
                  </select>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Frequency
                  </label>
                  <select
                    value={preferences.emailPreferences.frequency}
                    onChange={(e) => setPreferences(prev => ({
                      ...prev,
                      emailPreferences: { ...prev.emailPreferences, frequency: e.target.value as any }
                    }))}
                    className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="immediate">Immediate</option>
                    <option value="hourly_digest">Hourly Digest</option>
                    <option value="daily_digest">Daily Digest</option>
                  </select>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Email Categories</h4>
                <div className="space-y-3">
                  {categories.map((category) => (
                    <label key={category.key} className="flex items-start">
                      <input
                        type="checkbox"
                        checked={preferences.emailPreferences.categories[category.key]}
                        onChange={(e) => updateEmailCategory(category.key, e.target.checked)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mt-1"
                      />
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{category.label}</div>
                        <div className="text-xs text-gray-500">{category.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SMS Preferences */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <Smartphone className="h-5 w-5 text-gray-400 mr-3" />
              <h3 className="text-lg font-medium text-gray-900">SMS Notifications</h3>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferences.smsPreferences.enabled}
                    onChange={(e) => setPreferences(prev => ({
                      ...prev,
                      smsPreferences: { ...prev.smsPreferences, enabled: e.target.checked }
                    }))}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-900">Enable SMS notifications</span>
                </label>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={preferences.smsPreferences.phoneNumber}
                    onChange={(e) => setPreferences(prev => ({
                      ...prev,
                      smsPreferences: { ...prev.smsPreferences, phoneNumber: e.target.value }
                    }))}
                    className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Urgency Threshold
                  </label>
                  <select
                    value={preferences.smsPreferences.urgencyThreshold}
                    onChange={(e) => setPreferences(prev => ({
                      ...prev,
                      smsPreferences: { ...prev.smsPreferences, urgencyThreshold: e.target.value as any }
                    }))}
                    className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="medium">Medium and above</option>
                    <option value="high">High and urgent only</option>
                    <option value="urgent">Urgent only</option>
                  </select>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">SMS Categories</h4>
                <div className="space-y-3">
                  {categories.map((category) => (
                    <label key={category.key} className="flex items-start">
                      <input
                        type="checkbox"
                        checked={preferences.smsPreferences.categories[category.key]}
                        onChange={(e) => updateSmsCategory(category.key, e.target.checked)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mt-1"
                      />
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{category.label}</div>
                        <div className="text-xs text-gray-500">{category.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Push Preferences */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <Bell className="h-5 w-5 text-gray-400 mr-3" />
              <h3 className="text-lg font-medium text-gray-900">Push Notifications</h3>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferences.pushPreferences.enabled}
                    onChange={(e) => setPreferences(prev => ({
                      ...prev,
                      pushPreferences: { ...prev.pushPreferences, enabled: e.target.checked }
                    }))}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-900">Enable push notifications</span>
                </label>
                
                <div className="mt-4 space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={preferences.pushPreferences.soundEnabled}
                      onChange={(e) => setPreferences(prev => ({
                        ...prev,
                        pushPreferences: { ...prev.pushPreferences, soundEnabled: e.target.checked }
                      }))}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Play notification sound</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={preferences.pushPreferences.badgeEnabled}
                      onChange={(e) => setPreferences(prev => ({
                        ...prev,
                        pushPreferences: { ...prev.pushPreferences, badgeEnabled: e.target.checked }
                      }))}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Show app badge count</span>
                  </label>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Push Categories</h4>
                <div className="space-y-3">
                  {categories.map((category) => (
                    <label key={category.key} className="flex items-start">
                      <input
                        type="checkbox"
                        checked={preferences.pushPreferences.categories[category.key]}
                        onChange={(e) => updatePushCategory(category.key, e.target.checked)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mt-1"
                      />
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{category.label}</div>
                        <div className="text-xs text-gray-500">{category.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quiet Hours */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-gray-400 mr-3" />
              <h3 className="text-lg font-medium text-gray-900">Quiet Hours</h3>
            </div>
          </div>
          <div className="p-6">
            <label className="flex items-center mb-4">
              <input
                type="checkbox"
                checked={preferences.quietHours.enabled}
                onChange={(e) => setPreferences(prev => ({
                  ...prev,
                  quietHours: { ...prev.quietHours, enabled: e.target.checked }
                }))}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm font-medium text-gray-900">Enable quiet hours</span>
            </label>

            {preferences.quietHours.enabled && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={preferences.quietHours.startTime}
                    onChange={(e) => setPreferences(prev => ({
                      ...prev,
                      quietHours: { ...prev.quietHours, startTime: e.target.value }
                    }))}
                    className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={preferences.quietHours.endTime}
                    onChange={(e) => setPreferences(prev => ({
                      ...prev,
                      quietHours: { ...prev.quietHours, endTime: e.target.value }
                    }))}
                    className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Timezone
                  </label>
                  <select
                    value={preferences.quietHours.timezone}
                    onChange={(e) => setPreferences(prev => ({
                      ...prev,
                      quietHours: { ...prev.quietHours, timezone: e.target.value }
                    }))}
                    className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Emergency Contacts */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-gray-400 mr-3" />
                <h3 className="text-lg font-medium text-gray-900">Emergency Contacts</h3>
              </div>
              <button
                onClick={() => setShowEmergencyContactModal(true)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Contact
              </button>
            </div>
          </div>
          <div className="p-6">
            {preferences.emergencyContacts.length > 0 ? (
              <div className="space-y-4">
                {preferences.emergencyContacts.map((contact) => (
                  <div key={contact.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-medium text-gray-900">{contact.name}</h4>
                        {contact.isPrimary && (
                          <span className="bg-indigo-100 text-indigo-800 py-0.5 px-2 rounded-full text-xs font-medium">
                            Primary
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{contact.relationship}</p>
                      <p className="text-sm text-gray-500">{contact.phoneNumber}</p>
                      {contact.emailAddress && (
                        <p className="text-sm text-gray-500">{contact.emailAddress}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setEditingContact(contact);
                          setShowEmergencyContactModal(true);
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => removeEmergencyContact(contact.id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No emergency contacts configured.</p>
            )}
          </div>
        </div>
      </div>

      {/* Emergency Contact Modal */}
      {showEmergencyContactModal && (
        <EmergencyContactModal
          contact={editingContact}
          onClose={() => {
            setShowEmergencyContactModal(false);
            setEditingContact(null);
          }}
          onSave={(contact) => {
            if (editingContact) {
              updateEmergencyContact(editingContact.id, contact);
            } else {
              addEmergencyContact(contact);
            }
            setShowEmergencyContactModal(false);
            setEditingContact(null);
          }}
        />
      )}
    </div>
  );
}

// Emergency Contact Modal Component
function EmergencyContactModal({
  contact,
  onClose,
  onSave
}: {
  contact: EmergencyContact | null;
  onClose: () => void;
  onSave: (contact: Omit<EmergencyContact, 'id'>) => void;
}) {
  const [formData, setFormData] = useState({
    name: contact?.name || '',
    relationship: contact?.relationship || '',
    phoneNumber: contact?.phoneNumber || '',
    emailAddress: contact?.emailAddress || '',
    isPrimary: contact?.isPrimary || false,
    receiveAlerts: contact?.receiveAlerts ?? true
  });

  const handleSave = () => {
    if (!formData.name.trim() || !formData.phoneNumber.trim()) return;
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {contact ? 'Edit Emergency Contact' : 'Add Emergency Contact'}
          </h3>
        </div>
        
        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Relationship
            </label>
            <input
              type="text"
              value={formData.relationship}
              onChange={(e) => setFormData(prev => ({ ...prev, relationship: e.target.value }))}
              placeholder="e.g., Spouse, Parent, Sibling"
              className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
              className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={formData.emailAddress}
              onChange={(e) => setFormData(prev => ({ ...prev, emailAddress: e.target.value }))}
              className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isPrimary}
                onChange={(e) => setFormData(prev => ({ ...prev, isPrimary: e.target.checked }))}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700">Primary emergency contact</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.receiveAlerts}
                onChange={(e) => setFormData(prev => ({ ...prev, receiveAlerts: e.target.checked }))}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700">Receive emergency alerts</span>
            </label>
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
            onClick={handleSave}
            disabled={!formData.name.trim() || !formData.phoneNumber.trim()}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {contact ? 'Update Contact' : 'Add Contact'}
          </button>
        </div>
      </div>
    </div>
  );
}