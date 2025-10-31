import React, { useState, useEffect } from 'react';
import { Plus, Mail, Shield, User, CheckCircle, Clock, XCircle, AlertCircle, Edit2, Trash2, RefreshCw } from 'lucide-react';
import type { StaffInvitation, StaffMember, AdminProfile } from '../types';
import { apiClient } from '../lib/api';

interface StaffManagementPageProps {
  currentProfile: AdminProfile;
}

const StaffManagementPage: React.FC<StaffManagementPageProps> = ({ currentProfile }) => {
  console.log('🏢 StaffManagementPage component rendered with profile:', currentProfile);
  
  const [activeTab, setActiveTab] = useState<'staff' | 'invitations'>('staff');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [invitations, setInvitations] = useState<StaffInvitation[]>([]);
  const [loading, setLoading] = useState(true);

  // Load staff data from API
  useEffect(() => {
    loadStaffData();
  }, []);

  const loadStaffData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading staff data...');
      
      console.log('📞 Calling getStaff()...');
      const staffData = await apiClient.getStaff();
      console.log('✅ Staff data received:', staffData);
      console.log('Staff data type:', typeof staffData, 'Array?', Array.isArray(staffData));
      
      console.log('📞 Calling getStaffInvitations()...');
      const invitationsData = await apiClient.getStaffInvitations();
      console.log('✅ Invitations data received:', invitationsData);
      console.log('Invitations data type:', typeof invitationsData, 'Array?', Array.isArray(invitationsData));
      
      // Ensure we have valid arrays
      const validStaffData = Array.isArray(staffData) ? staffData : [];
      const validInvitationsData = Array.isArray(invitationsData) ? invitationsData : [];
      
      setStaffMembers(validStaffData);
      setInvitations(validInvitationsData);
      console.log('📊 Final state - Staff members:', validStaffData.length, 'Invitations:', validInvitationsData.length);
      
      // Validate first items to ensure proper structure
      if (validStaffData.length > 0) {
        console.log('First staff member sample:', validStaffData[0]);
      }
      if (validInvitationsData.length > 0) {
        console.log('First invitation sample:', validInvitationsData[0]);
      }
    } catch (error) {
      console.error('❌ Failed to load staff data:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        status: (error as any)?.status || 'No status',
        stack: error instanceof Error ? error.stack : 'No stack'
      });
      // Fallback to empty arrays on error
      setStaffMembers([]);
      setInvitations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteStaff = async (inviteData: {
    email: string;
    firstName: string;
    lastName: string;
    role: 'admin' | 'teacher' | 'manager';
  }) => {
    console.log('handleInviteStaff called with:', inviteData);
    
    try {
      console.log('Sending invitation...');
      const response = await apiClient.inviteStaff(inviteData);
      console.log('Invitation sent successfully:', response);
      
      setShowInviteModal(false);
      alert('Invitation sent successfully! The staff member will receive an email at ' + inviteData.email);
      
      // Reload invitations to show the new one
      await loadStaffData();
    } catch (error) {
      console.error('Failed to invite staff:', error);
      alert('Failed to send invitation: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleEditStaff = (staff: StaffMember) => {
    setEditingStaff(staff);
    setShowEditModal(true);
  };

  const handleUpdateStaff = async (updateData: {
    firstName: string;
    lastName: string;
    email: string;
    role: 'admin' | 'teacher' | 'manager';
    status?: 'active' | 'inactive';
  }) => {
    if (!editingStaff) return;

    try {
      // Prepare data for API call (API doesn't accept email updates)
      const apiUpdateData = {
        firstName: updateData.firstName,
        lastName: updateData.lastName,
        role: updateData.role,
        status: updateData.status || 'active'
      };
      
      await apiClient.updateStaff(editingStaff.id, apiUpdateData);
      setShowEditModal(false);
      setEditingStaff(null);
      await loadStaffData();
    } catch (error) {
      console.error('Failed to update staff:', error);
      alert('Failed to update staff member. Please try again.');
    }
  };

  const handleDeleteStaff = async (staffId: string) => {
    if (staffId === currentProfile.id) {
      alert('You cannot delete your own account.');
      return;
    }

    if (confirm('Are you sure you want to delete this staff member? This action cannot be undone.')) {
      try {
        await apiClient.deleteStaff(staffId);
        await loadStaffData();
      } catch (error) {
        console.error('Failed to delete staff:', error);
        alert('Failed to delete staff member. Please try again.');
      }
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    if (confirm('Are you sure you want to cancel this invitation?')) {
      try {
        await apiClient.cancelInvitation(invitationId);
        await loadStaffData();
      } catch (error) {
        console.error('Failed to cancel invitation:', error);
        alert('Failed to cancel invitation. Please try again.');
      }
    }
  };

  const handleResendInvitation = async (invitationId: string) => {
    try {
      await apiClient.resendInvitation(invitationId);
      await loadStaffData();
      alert('Invitation resent successfully!');
    } catch (error) {
      console.error('Failed to resend invitation:', error);
      alert('Failed to resend invitation. Please try again.');
    }
  };

  const getRoleDisplayName = (role: string) => {
    return role === 'manager' ? 'Manager' : role.charAt(0).toUpperCase() + role.slice(1);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return Shield;
      case 'teacher':
        return User;
      case 'manager':
        return User;
      default:
        return User;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return CheckCircle;
      case 'pending':
        return Clock;
      case 'inactive':
        return XCircle;
      case 'expired':
        return AlertCircle;
      default:
        return Clock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'inactive':
        return 'text-gray-600 bg-gray-50';
      case 'expired':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return 'N/A';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return 'Invalid Date';
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (date: Date | string | null | undefined) => {
    if (!date) return 'N/A';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return 'Invalid Date';
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-accent px-4 py-8">
        <div className="container mx-auto">
          <div className="flex items-center justify-center min-h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  // Add error boundary for render issues
  try {
    return (
    <div className="min-h-screen bg-accent px-4 py-8">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Staff Management</h1>
            <p className="text-gray-600">Manage staff members and invitations for your organization</p>
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            className="bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 transition-colors flex items-center space-x-2 shadow-sm"
          >
            <Plus className="h-5 w-5" />
            <span className="font-medium">Invite Staff</span>
          </button>
        </div>

        {/* Tabs and Actions */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('staff')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'staff'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Staff Members ({staffMembers.length})
            </button>
            <button
              onClick={() => setActiveTab('invitations')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'invitations'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Pending Invitations ({invitations.filter(i => i.status === 'pending').length})
            </button>
          </div>

          <button
            onClick={loadStaffData}
            disabled={loading}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors inline-flex items-center gap-2 disabled:opacity-50"
            title="Refresh data"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Staff Members Tab */}
        {activeTab === 'staff' && (
          <div className="bg-white rounded-lg shadow-brand border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Active Staff Members</h3>
                  <p className="text-sm text-gray-600 mt-1">Manage your team members and their roles</p>
                </div>
                <div className="text-sm text-gray-500">
                  {staffMembers.length} {staffMembers.length === 1 ? 'member' : 'members'}
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Staff Member
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {staffMembers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <User className="h-12 w-12 text-gray-300 mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No staff members yet</h3>
                          <p className="text-gray-500 mb-4">Get started by inviting your first staff member.</p>
                          <button
                            onClick={() => setShowInviteModal(true)}
                            className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition-colors inline-flex items-center gap-2"
                          >
                            <Plus className="h-4 w-4" />
                            Invite Staff Member
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    staffMembers.map((member) => {
                    const RoleIcon = getRoleIcon(member.role);
                    const StatusIcon = getStatusIcon(member.status);
                    
                    return (
                      <tr key={member.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-5 w-5 text-primary" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {member.firstName} {member.lastName}
                              </div>
                              <div className="text-sm text-gray-500">{member.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <RoleIcon className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900">
                              {getRoleDisplayName(member.role)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {member.lastLogin ? formatDateTime(member.lastLogin) : 'Never'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(member.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button 
                              onClick={() => handleEditStaff(member)}
                              className="text-gray-400 hover:text-yellow-600 p-1 rounded-md hover:bg-yellow-50 transition-colors"
                              title="Edit staff member"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            {member.id !== currentProfile.id && (
                              <button 
                                onClick={() => handleDeleteStaff(member.id)}
                                className="text-gray-400 hover:text-red-600 p-1 rounded-md hover:bg-red-50 transition-colors"
                                title="Delete staff member"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  }))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Invitations Tab */}
        {activeTab === 'invitations' && (
          <div className="bg-white rounded-lg shadow-brand border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Pending Invitations</h3>
                  <p className="text-sm text-gray-600 mt-1">Track staff invitations and their status</p>
                </div>
                <div className="text-sm text-gray-500">
                  {invitations.length} {invitations.length === 1 ? 'invitation' : 'invitations'}
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invited Person
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expires
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invitations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <Mail className="h-12 w-12 text-gray-300 mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No pending invitations</h3>
                          <p className="text-gray-500 mb-4">All invited staff have either accepted or had their invitations expired.</p>
                          <button
                            onClick={() => setShowInviteModal(true)}
                            className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition-colors inline-flex items-center gap-2"
                          >
                            <Plus className="h-4 w-4" />
                            Invite Staff Member
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    invitations.map((invitation) => {
                    const RoleIcon = getRoleIcon(invitation.role);
                    const StatusIcon = getStatusIcon(invitation.status);
                    const isExpired = new Date() > invitation.expiresAt;
                    
                    return (
                      <tr key={invitation.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                                <Mail className="h-5 w-5 text-gray-400" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {invitation.firstName} {invitation.lastName}
                              </div>
                              <div className="text-sm text-gray-500">{invitation.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <RoleIcon className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900">
                              {getRoleDisplayName(invitation.role)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            isExpired ? getStatusColor('expired') : getStatusColor(invitation.status)
                          }`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {isExpired ? 'Expired' : invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(invitation.invitedAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(invitation.expiresAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button 
                              onClick={() => handleResendInvitation(invitation.id)}
                              className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 px-3 py-1 rounded-md text-sm font-medium transition-colors"
                              title="Resend invitation"
                            >
                              Resend
                            </button>
                            <button 
                              onClick={() => handleCancelInvitation(invitation.id)}
                              className="text-gray-400 hover:text-red-600 p-1 rounded-md hover:bg-red-50 transition-colors"
                              title="Cancel invitation"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Invite Modal */}
        {showInviteModal && (
          <InviteStaffModal
            onClose={() => setShowInviteModal(false)}
            onInvite={handleInviteStaff}
          />
        )}

        {/* Edit Staff Modal */}
        {showEditModal && editingStaff && (
          <EditStaffModal
            staff={editingStaff}
            onClose={() => {
              setShowEditModal(false);
              setEditingStaff(null);
            }}
            onUpdate={handleUpdateStaff}
          />
        )}
      </div>
    </div>
    );
  } catch (renderError) {
    console.error('❌ Staff Management Page render error:', renderError);
    return (
      <div className="min-h-screen bg-accent px-4 py-8">
        <div className="container mx-auto max-w-6xl">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-medium text-red-800 mb-2">Error Loading Staff Management</h2>
            <p className="text-red-600 mb-4">
              There was an error loading the staff management page. Please try refreshing the page.
            </p>
            <p className="text-sm text-red-500">
              Error: {renderError instanceof Error ? renderError.message : 'Unknown error'}
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }
};

// Invite Staff Modal Component
interface InviteStaffModalProps {
  onClose: () => void;
  onInvite: (data: {
    email: string;
    firstName: string;
    lastName: string;
    role: 'admin' | 'teacher' | 'manager';
  }) => Promise<void>;
}

const InviteStaffModal: React.FC<InviteStaffModalProps> = ({ onClose, onInvite }) => {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'teacher' as 'admin' | 'teacher' | 'manager'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      await onInvite(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Invite Staff Member</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="user@musicalartsinstitute.org"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                role: e.target.value as 'admin' | 'teacher' | 'manager'
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="teacher">Teacher</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              {isSubmitting ? 'Sending...' : 'Send Invitation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit Staff Modal Component
interface EditStaffModalProps {
  staff: StaffMember;
  onClose: () => void;
  onUpdate: (data: {
    firstName: string;
    lastName: string;
    email: string;
    role: 'admin' | 'teacher' | 'manager';
    status?: 'active' | 'inactive';
  }) => void;
}

const EditStaffModal: React.FC<EditStaffModalProps> = ({ staff, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    firstName: staff.firstName,
    lastName: staff.lastName,
    email: staff.email,
    role: staff.role,
    status: staff.status as 'active' | 'inactive'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Edit Staff Member</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
              title="Email address cannot be changed"
            />
            <p className="text-xs text-gray-500 mt-1">Email address cannot be modified</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                role: e.target.value as 'admin' | 'teacher' | 'manager'
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="teacher">Teacher</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
            >
              Update Staff Member
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffManagementPage;