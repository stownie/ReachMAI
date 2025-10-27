import React, { useState, useEffect } from 'react';
import { Plus, Mail, Shield, User, CheckCircle, Clock, XCircle, AlertCircle, Edit2, Trash2 } from 'lucide-react';
import type { StaffInvitation, StaffMember, AdminProfile } from '../types';

interface StaffManagementPageProps {
  currentProfile: AdminProfile;
}

const StaffManagementPage: React.FC<StaffManagementPageProps> = ({ currentProfile }) => {
  const [activeTab, setActiveTab] = useState<'staff' | 'invitations'>('staff');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [invitations, setInvitations] = useState<StaffInvitation[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data for now - will be replaced with API calls
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setStaffMembers([
        {
          id: '1',
          email: 'stownsend@musicalartsinstitute.org',
          firstName: 'Shane',
          lastName: 'Townsend',
          role: 'admin',
          adminRole: {
            id: 'system_owner',
            name: 'System Owner',
            description: 'Full system access',
            level: 1,
            permissions: []
          },
          status: 'active',
          lastLogin: new Date('2024-10-24T10:30:00'),
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-10-24')
        },
        {
          id: '2',
          email: 'sarah.johnson@musicalartsinstitute.org',
          firstName: 'Sarah',
          lastName: 'Johnson',
          role: 'office_admin',
          status: 'active',
          invitedBy: '1',
          invitedAt: new Date('2024-02-15'),
          lastLogin: new Date('2024-10-23T14:20:00'),
          createdAt: new Date('2024-02-16'),
          updatedAt: new Date('2024-10-23')
        },
        {
          id: '3',
          email: 'mike.williams@musicalartsinstitute.org',
          firstName: 'Mike',
          lastName: 'Williams',
          role: 'teacher',
          status: 'active',
          invitedBy: '1',
          invitedAt: new Date('2024-03-01'),
          lastLogin: new Date('2024-10-22T09:15:00'),
          createdAt: new Date('2024-03-02'),
          updatedAt: new Date('2024-10-22')
        }
      ]);

      setInvitations([
        {
          id: '1',
          email: 'emma.davis@musicalartsinstitute.org',
          firstName: 'Emma',
          lastName: 'Davis',
          role: 'teacher',
          status: 'pending',
          invitedBy: '1',
          invitedAt: new Date('2024-10-20'),
          expiresAt: new Date('2024-10-27'),
          token: 'abc123def456'
        },
        {
          id: '2',
          email: 'john.smith@musicalartsinstitute.org',
          firstName: 'John',
          lastName: 'Smith',
          role: 'admin',
          adminRole: 'super_admin',
          status: 'pending',
          invitedBy: '1',
          invitedAt: new Date('2024-10-22'),
          expiresAt: new Date('2024-10-29'),
          token: 'xyz789uvw012'
        }
      ]);

      setLoading(false);
    }, 1000);
  }, []);

  const getRoleDisplayName = (role: string, adminRole?: string) => {
    if (role === 'admin') {
      switch (adminRole) {
        case 'system_owner':
          return 'System Owner';
        case 'super_admin':
          return 'Super Admin';
        case 'office_admin':
          return 'Office Admin';
        default:
          return 'Admin';
      }
    }
    return role === 'office_admin' ? 'Office Admin' : role.charAt(0).toUpperCase() + role.slice(1);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return Shield;
      case 'teacher':
        return User;
      case 'office_admin':
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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleDateString('en-US', {
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

  return (
    <div className="min-h-screen bg-accent px-4 py-8">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Staff Management</h1>
          <p className="text-gray-600">Manage staff members and invitations for your organization</p>
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
            onClick={() => setShowInviteModal(true)}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Invite Staff Member
          </button>
        </div>

        {/* Staff Members Tab */}
        {activeTab === 'staff' && (
          <div className="bg-white rounded-lg shadow-brand border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Active Staff Members</h3>
              <p className="text-sm text-gray-600 mt-1">Manage your team members and their roles</p>
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
                  {staffMembers.map((member) => {
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
                              {getRoleDisplayName(member.role, member.adminRole?.name.toLowerCase().replace(' ', '_'))}
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
                            <button className="text-gray-400 hover:text-gray-600">
                              <Edit2 className="h-4 w-4" />
                            </button>
                            {member.id !== currentProfile.id && (
                              <button className="text-gray-400 hover:text-red-600">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Invitations Tab */}
        {activeTab === 'invitations' && (
          <div className="bg-white rounded-lg shadow-brand border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Pending Invitations</h3>
              <p className="text-sm text-gray-600 mt-1">Track staff invitations and their status</p>
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
                  {invitations.map((invitation) => {
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
                              {getRoleDisplayName(invitation.role, invitation.adminRole)}
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
                            <button className="text-primary hover:text-primary/80 text-sm">
                              Resend
                            </button>
                            <button className="text-gray-400 hover:text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Invite Modal */}
        {showInviteModal && (
          <InviteStaffModal
            onClose={() => setShowInviteModal(false)}
            onInvite={(inviteData) => {
              // TODO: Send invitation via API
              console.log('Inviting staff:', inviteData);
              setShowInviteModal(false);
              // Refresh invitations list
            }}
          />
        )}
      </div>
    </div>
  );
};

// Invite Staff Modal Component
interface InviteStaffModalProps {
  onClose: () => void;
  onInvite: (data: {
    email: string;
    firstName: string;
    lastName: string;
    role: 'admin' | 'teacher' | 'office_admin';
    adminRole?: string;
  }) => void;
}

const InviteStaffModal: React.FC<InviteStaffModalProps> = ({ onClose, onInvite }) => {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'teacher' as 'admin' | 'teacher' | 'office_admin',
    adminRole: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onInvite(formData);
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
                role: e.target.value as 'admin' | 'teacher' | 'office_admin',
                adminRole: e.target.value !== 'admin' ? '' : prev.adminRole
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="teacher">Teacher</option>
              <option value="office_admin">Office Admin</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {formData.role === 'admin' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Role
              </label>
              <select
                value={formData.adminRole}
                onChange={(e) => setFormData(prev => ({ ...prev, adminRole: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Select Admin Role</option>
                <option value="super_admin">Super Admin</option>
                <option value="office_admin">Office Admin</option>
              </select>
            </div>
          )}

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
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            >
              Send Invitation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffManagementPage;