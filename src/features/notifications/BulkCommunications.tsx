import { useState } from 'react';
import { Send, Calendar, Filter, Eye, Edit, Trash2, Plus, Mail, MessageSquare, AlertTriangle, FileText, Download } from 'lucide-react';
import { getRelativeTime } from '../../lib/notifications';
import { mockCampaigns } from '../../lib/mockNotificationData';
import type { Campaign, AudienceFilter, NotificationChannel, UserProfileType } from '../../types';

export default function BulkCommunications() {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'create' | 'templates'>('campaigns');
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [campaigns] = useState<Campaign[]>(mockCampaigns);

  const handleCreateCampaign = (campaignData: Partial<Campaign>) => {
    console.log('Creating campaign:', campaignData);
    // In real app, this would call an API to create the campaign
  };

  const handleSendCampaign = (campaignId: string) => {
    console.log('Sending campaign:', campaignId);
    // In real app, this would call an API to send the campaign
  };

  const handleDeleteCampaign = (campaignId: string) => {
    console.log('Deleting campaign:', campaignId);
    // In real app, this would call an API to delete the campaign
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Bulk Communications</h1>
            <p className="text-gray-600">
              Send announcements, newsletters, and emergency notifications to groups of users
            </p>
          </div>
          <button
            onClick={() => setActiveTab('create')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Campaign
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'campaigns'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Campaigns ({campaigns.length})
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'create'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Create Campaign
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'templates'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Templates
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'campaigns' && (
        <CampaignsList
          campaigns={campaigns}
          onView={setSelectedCampaign}
          onSend={handleSendCampaign}
          onDelete={handleDeleteCampaign}
        />
      )}

      {activeTab === 'create' && (
        <CreateCampaign
          onSave={handleCreateCampaign}
          onCancel={() => setActiveTab('campaigns')}
        />
      )}

      {activeTab === 'templates' && (
        <TemplateManager />
      )}

      {/* Campaign Detail Modal */}
      {selectedCampaign && (
        <CampaignDetailModal
          campaign={campaigns.find(c => c.id === selectedCampaign)!}
          onClose={() => setSelectedCampaign(null)}
        />
      )}
    </div>
  );
}

// Campaigns List Component
function CampaignsList({
  campaigns,
  onView,
  onSend,
  onDelete
}: {
  campaigns: Campaign[];
  onView: (campaignId: string) => void;
  onSend: (campaignId: string) => void;
  onDelete: (campaignId: string) => void;
}) {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    const matchesType = typeFilter === 'all' || campaign.type === typeFilter;
    return matchesStatus && matchesType;
  });

  const getStatusColor = (status: Campaign['status']) => {
    switch (status) {
      case 'draft':
        return 'text-gray-600 bg-gray-100';
      case 'scheduled':
        return 'text-blue-600 bg-blue-100';
      case 'sending':
        return 'text-yellow-600 bg-yellow-100';
      case 'sent':
        return 'text-green-600 bg-green-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: Campaign['type']) => {
    switch (type) {
      case 'announcement':
        return <MessageSquare className="h-4 w-4" />;
      case 'newsletter':
        return <FileText className="h-4 w-4" />;
      case 'reminder':
        return <Calendar className="h-4 w-4" />;
      case 'emergency':
        return <AlertTriangle className="h-4 w-4" />;
      case 'marketing':
        return <Mail className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-auto rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="sending">Sending</option>
                <option value="sent">Sent</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="block w-auto rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
            >
              <option value="all">All Types</option>
              <option value="announcement">Announcement</option>
              <option value="newsletter">Newsletter</option>
              <option value="reminder">Reminder</option>
              <option value="emergency">Emergency</option>
              <option value="marketing">Marketing</option>
            </select>
          </div>

          <div className="text-sm text-gray-500">
            {filteredCampaigns.length} of {campaigns.length} campaigns
          </div>
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCampaigns.map((campaign) => (
          <div key={campaign.id} className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  {getTypeIcon(campaign.type)}
                  <h3 className="text-lg font-medium text-gray-900 truncate">
                    {campaign.name}
                  </h3>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(campaign.status)}`}>
                  {campaign.status}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {campaign.description}
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <span className="text-gray-500">Recipients:</span>
                  <span className="ml-1 font-medium">{campaign.stats.totalRecipients}</span>
                </div>
                <div>
                  <span className="text-gray-500">Opened:</span>
                  <span className="ml-1 font-medium">
                    {campaign.stats.totalRecipients > 0 
                      ? Math.round((campaign.stats.opened / campaign.stats.totalRecipients) * 100)
                      : 0}%
                  </span>
                </div>
              </div>

              <div className="text-xs text-gray-500 mb-4">
                {campaign.sentAt ? `Sent ${getRelativeTime(campaign.sentAt)}` : 
                 campaign.scheduledFor ? `Scheduled for ${getRelativeTime(campaign.scheduledFor)}` :
                 `Created ${getRelativeTime(campaign.createdAt)}`}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onView(campaign.id)}
                    className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  {campaign.status === 'draft' && (
                    <>
                      <button className="text-gray-400 hover:text-gray-600 text-sm">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(campaign.id)}
                        className="text-gray-400 hover:text-red-600 text-sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
                
                {campaign.status === 'draft' && (
                  <button
                    onClick={() => onSend(campaign.id)}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                  >
                    <Send className="h-3 w-3 mr-1" />
                    Send
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCampaigns.length === 0 && (
        <div className="text-center py-12">
          <Mail className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No campaigns</h3>
          <p className="mt-1 text-sm text-gray-500">
            {statusFilter !== 'all' || typeFilter !== 'all' 
              ? 'No campaigns match the selected filters.'
              : 'Get started by creating your first campaign.'}
          </p>
        </div>
      )}
    </div>
  );
}

// Create Campaign Component
function CreateCampaign({
  onSave,
  onCancel
}: {
  onSave: (campaign: Partial<Campaign>) => void;
  onCancel: () => void;
}) {
  const [step, setStep] = useState(1);
  const [campaignData, setCampaignData] = useState<Partial<Campaign>>({
    name: '',
    description: '',
    type: 'announcement',
    content: {
      subject: '',
      htmlContent: '',
      textContent: '',
      attachments: []
    },
    audienceFilter: {
      userTypes: ['parent'],
      enrollmentStatus: ['enrolled']
    },
    channels: ['email', 'in_app'],
    scheduledFor: undefined
  });

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSave = () => {
    onSave(campaignData);
  };

  return (
    <div className="bg-white shadow rounded-lg">
      {/* Step Progress */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Create New Campaign</h3>
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div
                key={stepNumber}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  stepNumber === step
                    ? 'bg-indigo-600 text-white'
                    : stepNumber < step
                    ? 'bg-indigo-100 text-indigo-600'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {stepNumber}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6">
        {step === 1 && (
          <CampaignBasicsStep
            data={campaignData}
            onChange={setCampaignData}
          />
        )}

        {step === 2 && (
          <AudienceSelectionStep
            data={campaignData}
            onChange={setCampaignData}
          />
        )}

        {step === 3 && (
          <ContentCreationStep
            data={campaignData}
            onChange={setCampaignData}
          />
        )}

        {step === 4 && (
          <ReviewAndScheduleStep
            data={campaignData}
            onChange={setCampaignData}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
        <div>
          {step > 1 && (
            <button
              onClick={handlePrevious}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Previous
            </button>
          )}
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          
          {step < 4 ? (
            <button
              onClick={handleNext}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Create Campaign
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Campaign Creation Steps
function CampaignBasicsStep({
  data,
  onChange
}: {
  data: Partial<Campaign>;
  onChange: (data: Partial<Campaign>) => void;
}) {
  return (
    <div className="space-y-6">
      <h4 className="text-lg font-medium text-gray-900">Campaign Basics</h4>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Campaign Name *
        </label>
        <input
          type="text"
          value={data.name || ''}
          onChange={(e) => onChange({ ...data, name: e.target.value })}
          className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="e.g., November Parent Newsletter"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={data.description || ''}
          onChange={(e) => onChange({ ...data, description: e.target.value })}
          rows={3}
          className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Brief description of this campaign"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Campaign Type *
        </label>
        <select
          value={data.type || 'announcement'}
          onChange={(e) => onChange({ ...data, type: e.target.value as any })}
          className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="announcement">Announcement</option>
          <option value="newsletter">Newsletter</option>
          <option value="reminder">Reminder</option>
          <option value="emergency">Emergency Alert</option>
          <option value="marketing">Marketing</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Communication Channels *
        </label>
        <div className="space-y-2">
          {(['email', 'sms', 'push', 'in_app'] as NotificationChannel[]).map((channel) => (
            <label key={channel} className="flex items-center">
              <input
                type="checkbox"
                checked={data.channels?.includes(channel) || false}
                onChange={(e) => {
                  const currentChannels = data.channels || [];
                  const newChannels = e.target.checked
                    ? [...currentChannels, channel]
                    : currentChannels.filter(c => c !== channel);
                  onChange({ ...data, channels: newChannels });
                }}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700 capitalize">{channel.replace('_', ' ')}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

function AudienceSelectionStep({
  data,
  onChange
}: {
  data: Partial<Campaign>;
  onChange: (data: Partial<Campaign>) => void;
}) {
  const userTypes: UserProfileType[] = ['student', 'parent', 'teacher', 'adult'];

  return (
    <div className="space-y-6">
      <h4 className="text-lg font-medium text-gray-900">Select Audience</h4>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          User Types *
        </label>
        <div className="grid grid-cols-2 gap-2">
          {userTypes.map((type) => (
            <label key={type} className="flex items-center">
              <input
                type="checkbox"
                checked={data.audienceFilter?.userTypes?.includes(type) || false}
                onChange={(e) => {
                  const currentTypes = data.audienceFilter?.userTypes || [];
                  const newTypes = e.target.checked
                    ? [...currentTypes, type]
                    : currentTypes.filter(t => t !== type);
                  onChange({
                    ...data,
                    audienceFilter: {
                      ...data.audienceFilter!,
                      userTypes: newTypes
                    }
                  });
                }}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700 capitalize">{type}s</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Estimated Recipients
        </label>
        <div className="text-2xl font-bold text-indigo-600">
          {calculateEstimatedRecipients(data.audienceFilter)}
        </div>
        <p className="text-sm text-gray-500">Based on current enrollment data</p>
      </div>
    </div>
  );
}

function ContentCreationStep({
  data,
  onChange
}: {
  data: Partial<Campaign>;
  onChange: (data: Partial<Campaign>) => void;
}) {
  return (
    <div className="space-y-6">
      <h4 className="text-lg font-medium text-gray-900">Create Content</h4>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Subject Line *
        </label>
        <input
          type="text"
          value={data.content?.subject || ''}
          onChange={(e) => onChange({
            ...data,
            content: { ...data.content!, subject: e.target.value }
          })}
          className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Enter email subject line"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Message Content *
        </label>
        <textarea
          value={data.content?.textContent || ''}
          onChange={(e) => onChange({
            ...data,
            content: { ...data.content!, textContent: e.target.value, htmlContent: e.target.value }
          })}
          rows={10}
          className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Enter your message content here..."
        />
      </div>
    </div>
  );
}

function ReviewAndScheduleStep({
  data,
  onChange
}: {
  data: Partial<Campaign>;
  onChange: (data: Partial<Campaign>) => void;
}) {
  return (
    <div className="space-y-6">
      <h4 className="text-lg font-medium text-gray-900">Review & Schedule</h4>
      
      <div className="bg-gray-50 rounded-lg p-4">
        <h5 className="font-medium text-gray-900 mb-2">Campaign Summary</h5>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-500">Name:</dt>
            <dd className="text-gray-900">{data.name}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Type:</dt>
            <dd className="text-gray-900 capitalize">{data.type}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Channels:</dt>
            <dd className="text-gray-900">{data.channels?.join(', ')}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Recipients:</dt>
            <dd className="text-gray-900">{calculateEstimatedRecipients(data.audienceFilter)}</dd>
          </div>
        </dl>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Delivery Options
        </label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="delivery"
              checked={!data.scheduledFor}
              onChange={() => onChange({ ...data, scheduledFor: undefined })}
              className="border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="ml-2 text-sm text-gray-700">Send immediately</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="delivery"
              checked={!!data.scheduledFor}
              onChange={() => onChange({ ...data, scheduledFor: new Date() })}
              className="border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="ml-2 text-sm text-gray-700">Schedule for later</span>
          </label>
        </div>
        
        {data.scheduledFor && (
          <div className="mt-3">
            <input
              type="datetime-local"
              value={data.scheduledFor.toISOString().slice(0, 16)}
              onChange={(e) => onChange({ ...data, scheduledFor: new Date(e.target.value) })}
              className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Template Manager Component
function TemplateManager() {
  return (
    <div className="text-center py-12">
      <FileText className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-medium text-gray-900">Template Manager</h3>
      <p className="mt-1 text-sm text-gray-500">
        Manage reusable templates for your campaigns. Coming soon!
      </p>
    </div>
  );
}

// Campaign Detail Modal
function CampaignDetailModal({
  campaign,
  onClose
}: {
  campaign: Campaign;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">{campaign.name}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Campaign Info */}
            <div className="lg:col-span-2">
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Campaign Details</h4>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Type:</dt>
                      <dd className="text-gray-900 capitalize">{campaign.type}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Status:</dt>
                      <dd className="text-gray-900 capitalize">{campaign.status}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Created:</dt>
                      <dd className="text-gray-900">{getRelativeTime(campaign.createdAt)}</dd>
                    </div>
                    {campaign.sentAt && (
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Sent:</dt>
                        <dd className="text-gray-900">{getRelativeTime(campaign.sentAt)}</dd>
                      </div>
                    )}
                  </dl>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Content</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 mb-2">{campaign.content.subject}</h5>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {campaign.content.textContent}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-4">Campaign Statistics</h4>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">Total Recipients</span>
                    <span className="text-lg font-bold text-gray-900">{campaign.stats.totalRecipients}</span>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-green-600">Delivered</span>
                    <span className="text-lg font-bold text-green-700">{campaign.stats.delivered}</span>
                  </div>
                  <div className="text-xs text-green-600">
                    {campaign.stats.totalRecipients > 0 
                      ? Math.round((campaign.stats.delivered / campaign.stats.totalRecipients) * 100)
                      : 0}% delivery rate
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-blue-600">Opened</span>
                    <span className="text-lg font-bold text-blue-700">{campaign.stats.opened}</span>
                  </div>
                  <div className="text-xs text-blue-600">
                    {campaign.stats.delivered > 0 
                      ? Math.round((campaign.stats.opened / campaign.stats.delivered) * 100)
                      : 0}% open rate
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-purple-600">Clicked</span>
                    <span className="text-lg font-bold text-purple-700">{campaign.stats.clicked}</span>
                  </div>
                  <div className="text-xs text-purple-600">
                    {campaign.stats.opened > 0 
                      ? Math.round((campaign.stats.clicked / campaign.stats.opened) * 100)
                      : 0}% click rate
                  </div>
                </div>
              </div>

              <button className="mt-4 w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to calculate estimated recipients
function calculateEstimatedRecipients(audienceFilter?: AudienceFilter): number {
  if (!audienceFilter?.userTypes) return 0;
  
  // Mock calculation based on user types
  const estimates = {
    student: 120,
    parent: 85,
    teacher: 15,
    adult: 30
  };
  
  return audienceFilter.userTypes.reduce((total, type) => {
    return total + (estimates[type] || 0);
  }, 0);
}