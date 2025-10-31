import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  User, 
  GraduationCap, 
  UserCheck, 
  Shield, 
  Building, 
  Heart,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import type { UserProfile, AdminProfile } from '../types';
import { apiClient } from '../lib/api';

interface UserManagementPageProps {
  currentProfile: AdminProfile;
}

interface UserWithAccount {
  id: string;
  email: string;
  phone?: string;
  profiles: UserProfile[];
  createdAt: Date;
  updatedAt: Date;
  primaryProfile: UserProfile | null;
}

const UserManagementPage: React.FC<UserManagementPageProps> = ({ currentProfile }) => {
  const [users, setUsers] = useState<UserWithAccount[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserType, setSelectedUserType] = useState<string>('all');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithAccount | null>(null);

  const userTypeFilters = [
    { value: 'all', label: 'All Users', icon: Users, count: 0 },
    { value: 'student', label: 'Students', icon: GraduationCap, count: 0 },
    { value: 'parent', label: 'Parents', icon: Heart, count: 0 },
    { value: 'adult', label: 'Adults', icon: User, count: 0 },
    { value: 'teacher', label: 'Teachers', icon: UserCheck, count: 0 },
    { value: 'admin', label: 'Admins', icon: Shield, count: 0 },
    { value: 'manager', label: 'Managers', icon: Building, count: 0 },
  ];

  // Load users from API
  useEffect(() => {
    loadUsers();
  }, []);

  // Update filtered users when search term or user type changes
  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, selectedUserType]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading user data...');
      
      // Load real user data from API
      console.log('📞 Calling getAllUsers()...');
      const userData = await apiClient.getAllUsers();
      console.log('✅ User data received:', userData);
      
      // Transform API data to match component interface
      const transformedUsers: UserWithAccount[] = userData.map(user => ({
        ...user,
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt),
        profiles: user.profiles.map((profile: any) => ({
          ...profile,
          createdAt: new Date(profile.createdAt),
          updatedAt: new Date(profile.updatedAt)
        })),
        primaryProfile: user.primaryProfile ? {
          ...user.primaryProfile,
          createdAt: new Date(user.primaryProfile.createdAt),
          updatedAt: new Date(user.primaryProfile.updatedAt)
        } : null
      }));
      
      setUsers(transformedUsers);
      console.log('📊 Final state - Users:', transformedUsers.length);
      
    } catch (error) {
      console.error('❌ Failed to load user data:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        status: (error as any)?.status || 'No status',
        stack: error instanceof Error ? error.stack : 'No stack'
      });
      // Fallback to empty array on error
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(user => {
        if (!user.primaryProfile) return user.email.toLowerCase().includes(term);
        
        return (
          user.primaryProfile.firstName.toLowerCase().includes(term) ||
          user.primaryProfile.lastName.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term) ||
          (user.primaryProfile.preferredName && user.primaryProfile.preferredName.toLowerCase().includes(term))
        );
      });
    }

    // Filter by user type
    if (selectedUserType !== 'all') {
      filtered = filtered.filter(user => 
        user.primaryProfile && user.primaryProfile.type === selectedUserType
      );
    }

    setFilteredUsers(filtered);

    // Update counts for filter buttons
    userTypeFilters.forEach(filter => {
      if (filter.value === 'all') {
        filter.count = users.length;
      } else {
        filter.count = users.filter(user => 
          user.primaryProfile && user.primaryProfile.type === filter.value
        ).length;
      }
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'student': return GraduationCap;
      case 'parent': return Heart;
      case 'adult': return User;
      case 'teacher': return UserCheck;
      case 'admin': return Shield;
      case 'manager': return Building;
      default: return User;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'student': return 'bg-blue-100 text-blue-800';
      case 'parent': return 'bg-pink-100 text-pink-800';
      case 'adult': return 'bg-green-100 text-green-800';
      case 'teacher': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleSelectUser = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map(user => user.id)));
    }
  };

  const handleEditUser = (user: UserWithAccount) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        // TODO: Implement delete API call
        // await apiClient.deleteUser(userId);
        console.log('Delete user:', userId);
        await loadUsers();
      } catch (error) {
        console.error('Failed to delete user:', error);
        alert('Failed to delete user. Please try again.');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.size === 0) return;
    
    if (confirm(`Are you sure you want to delete ${selectedUsers.size} users? This action cannot be undone.`)) {
      try {
        // TODO: Implement bulk delete API call
        console.log('Bulk delete users:', Array.from(selectedUsers));
        setSelectedUsers(new Set());
        await loadUsers();
      } catch (error) {
        console.error('Failed to delete users:', error);
        alert('Failed to delete users. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600 mt-2">
                Manage all users across the ReachMAI platform
              </p>
            </div>
            <button
              onClick={() => setShowAddUserModal(true)}
              className="flex items-center space-x-2 bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Add User</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            {/* Bulk Actions */}
            {selectedUsers.size > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {selectedUsers.size} selected
                </span>
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center space-x-1 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>

          {/* User Type Filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            {userTypeFilters.map((filter) => {
              const Icon = filter.icon;
              const isActive = selectedUserType === filter.value;
              
              return (
                <button
                  key={filter.value}
                  onClick={() => setSelectedUserType(filter.value)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{filter.label}</span>
                  <span className="bg-white px-2 py-1 rounded-full text-xs">
                    {filter.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => {
                  const profile = user.primaryProfile;
                  if (!profile) return null; // Skip accounts without profiles
                  const TypeIcon = getTypeIcon(profile.type);
                  
                  return (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedUsers.has(user.id)}
                          onChange={() => handleSelectUser(user.id)}
                          className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <TypeIcon className="h-5 w-5 text-gray-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {profile.preferredName || profile.firstName} {profile.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(profile.type)}`}>
                          {profile.type.charAt(0).toUpperCase() + profile.type.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="space-y-1">
                          {profile.email && (
                            <div className="flex items-center space-x-1">
                              <Mail className="h-3 w-3 text-gray-400" />
                              <span className="truncate max-w-xs">{profile.email}</span>
                              {profile.emailVerified && <CheckCircle className="h-3 w-3 text-green-500" />}
                            </div>
                          )}
                          {profile.phone && (
                            <div className="flex items-center space-x-1">
                              <Phone className="h-3 w-3 text-gray-400" />
                              <span>{profile.phone}</span>
                              {profile.phoneVerified && <CheckCircle className="h-3 w-3 text-green-500" />}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {profile.emailVerified && profile.phoneVerified ? (
                            <div className="flex items-center space-x-1 text-green-600">
                              <CheckCircle className="h-4 w-4" />
                              <span className="text-sm">Verified</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1 text-yellow-600">
                              <Clock className="h-4 w-4" />
                              <span className="text-sm">Pending</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="text-amber-600 hover:text-amber-900 p-1 rounded-md hover:bg-amber-50"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || selectedUserType !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Get started by adding your first user'}
                </p>
                {!searchTerm && selectedUserType === 'all' && (
                  <div className="mt-6">
                    <button
                      onClick={() => setShowAddUserModal(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add User
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">User Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {userTypeFilters.filter(f => f.value !== 'all').map((filter) => {
              const Icon = filter.icon;
              return (
                <div key={filter.value} className="text-center">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-2 ${getTypeColor(filter.value)}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{filter.count}</div>
                  <div className="text-sm text-gray-500">{filter.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <AddUserModal
          onClose={() => setShowAddUserModal(false)}
          onSuccess={() => {
            setShowAddUserModal(false);
            loadUsers(); // Reload the user list
          }}
        />
      )}

      {/* TODO: Edit User Modal */}
      {showEditModal && editingUser && editingUser.primaryProfile && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Edit User: {editingUser.primaryProfile.firstName} {editingUser.primaryProfile.lastName}
            </h3>
            <p className="text-gray-600 mb-4">
              User editing functionality will be implemented in the next phase.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Add User Modal Component
interface AddUserModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const AddUserModal: React.FC<AddUserModalProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    profileType: 'student' as 'student' | 'parent' | 'adult' | 'teacher' | 'admin' | 'manager',
    preferredContactMethod: 'email' as 'email' | 'phone',
    sendInvitation: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const profileTypeOptions = [
    { value: 'student', label: 'Student', icon: GraduationCap, description: 'A student taking classes' },
    { value: 'parent', label: 'Parent', icon: Heart, description: 'Parent or guardian of a student' },
    { value: 'adult', label: 'Adult Student', icon: User, description: 'Adult taking classes' },
    { value: 'teacher', label: 'Teacher', icon: UserCheck, description: 'Music instructor' },
    { value: 'admin', label: 'Administrator', icon: Shield, description: 'System administrator' },
    { value: 'manager', label: 'Manager', icon: Building, description: 'Program or facility manager' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
        setError('Please fill in all required fields');
        return;
      }

      // Create the user with profile
      const userData = {
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        password: 'temp_password_' + Date.now(), // Temporary password, user will set their own
        profile: {
          type: formData.profileType,
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          preferredContactMethod: formData.preferredContactMethod
        },
        sendInvitation: formData.sendInvitation
      };

      console.log('Creating user with data:', userData);
      const result = await apiClient.createUser(userData);
      console.log('User created successfully:', result);

      onSuccess();
      
      if (formData.sendInvitation) {
        alert(`User created successfully! An invitation email has been sent to ${formData.email}`);
      } else {
        alert('User created successfully!');
      }
    } catch (error) {
      console.error('Failed to create user:', error);
      setError(error instanceof Error ? error.message : 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const selectedProfileType = profileTypeOptions.find(opt => opt.value === formData.profileType);

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Add New User</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Profile Type *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {profileTypeOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, profileType: option.value as any }))}
                    className={`p-3 border rounded-lg text-left transition-colors ${
                      formData.profileType === option.value
                        ? 'border-amber-500 bg-amber-50 text-amber-900'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <Icon className="h-4 w-4" />
                      <span className="font-medium text-sm">{option.label}</span>
                    </div>
                    <p className="text-xs text-gray-600">{option.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number (Optional)
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="(555) 123-4567"
            />
          </div>

          {/* Preferred Contact Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Contact Method
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="email"
                  checked={formData.preferredContactMethod === 'email'}
                  onChange={(e) => setFormData(prev => ({ ...prev, preferredContactMethod: e.target.value as 'email' | 'phone' }))}
                  className="mr-2"
                />
                <Mail className="h-4 w-4 mr-1" />
                Email
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="phone"
                  checked={formData.preferredContactMethod === 'phone'}
                  onChange={(e) => setFormData(prev => ({ ...prev, preferredContactMethod: e.target.value as 'email' | 'phone' }))}
                  className="mr-2"
                />
                <Phone className="h-4 w-4 mr-1" />
                Phone
              </label>
            </div>
          </div>

          {/* Send Invitation Option */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="sendInvitation"
              checked={formData.sendInvitation}
              onChange={(e) => setFormData(prev => ({ ...prev, sendInvitation: e.target.checked }))}
              className="mr-3"
            />
            <label htmlFor="sendInvitation" className="text-sm text-gray-700">
              Send invitation email to complete profile setup
            </label>
          </div>

          {/* Selected Profile Info */}
          {selectedProfileType && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <selectedProfileType.icon className="h-5 w-5 text-amber-600" />
                <span className="font-medium text-gray-900">Creating {selectedProfileType.label}</span>
              </div>
              <p className="text-sm text-gray-600">{selectedProfileType.description}</p>
              {formData.sendInvitation && (
                <p className="text-sm text-amber-600 mt-2">
                  An invitation will be sent to complete their profile with additional required information.
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading && <Clock className="h-4 w-4 animate-spin" />}
              <span>{loading ? 'Creating...' : 'Create User'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserManagementPage;