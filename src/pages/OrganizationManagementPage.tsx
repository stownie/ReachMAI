import React, { useState, useEffect } from 'react';
import { 
  Building, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Shield, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Users,
  BookOpen,
  Award
} from 'lucide-react';
import { apiClient } from '../lib/api';

interface Organization {
  id: string;
  name: string;
  catalog_code: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  requires_clearance: boolean;
  is_active: boolean;
  programs_count: number;
  teachers_with_clearance: number;
  created_at: string;
  updated_at: string;
}



interface Campus {
  id: string;
  organization_id: string;
  name: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  phone?: string;
  email?: string;
  is_primary: boolean;
  is_active: boolean;
  organization_name?: string;
  created_at: string;
  updated_at: string;
}



const OrganizationManagementPage: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [filteredOrganizations, setFilteredOrganizations] = useState<Organization[]>([]);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'organizations' | 'campuses'>('organizations');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddCampusModal, setShowAddCampusModal] = useState(false);
  const [showEditCampusModal, setShowEditCampusModal] = useState(false);
  const [editingOrganization, setEditingOrganization] = useState<Organization | null>(null);
  const [editingCampus, setEditingCampus] = useState<Campus | null>(null);
  const [selectedOrganizationForCampus, setSelectedOrganizationForCampus] = useState<string>('');

  const [formData, setFormData] = useState({
    name: '',
    catalogCode: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    requiresClearance: false
  });

  const [campusFormData, setCampusFormData] = useState({
    name: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'USA',
    phone: '',
    email: '',
    isPrimary: false
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const filtered = organizations.filter(org =>
      org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.catalog_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (org.address && org.address.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredOrganizations(filtered);
  }, [searchTerm, organizations]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [orgsResponse, campusesResponse] = await Promise.all([
        apiClient.getOrganizations(),
        apiClient.getAllCampuses()
      ]);
      
      setOrganizations(orgsResponse);
      setCampuses(campusesResponse);
      setFilteredOrganizations(orgsResponse);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      catalogCode: '',
      address: '',
      phone: '',
      email: '',
      website: '',
      requiresClearance: false
    });
    setEditingOrganization(null);
  };

  const handleAddOrganization = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleEditOrganization = async (org: Organization) => {
    try {
      // Load full organization details including clearance requirements
      const fullOrg = await apiClient.request(`/organizations/${org.id}`);
      
      setFormData({
        name: fullOrg.name,
        catalogCode: fullOrg.catalog_code,
        address: fullOrg.address || '',
        phone: fullOrg.phone || '',
        email: fullOrg.email || '',
        website: fullOrg.website || '',
        clearanceRequirements: fullOrg.clearanceRequirements || []
      });
      setEditingOrganization(fullOrg);
      setShowEditModal(true);
    } catch (error) {
      console.error('Failed to load organization details:', error);
    }
  };

  const handleDeleteOrganization = async (id: string) => {
    if (!confirm('Are you sure you want to delete this organization? This action cannot be undone.')) {
      return;
    }

    try {
      await apiClient.deleteOrganization(id);
      await loadData();
    } catch (error) {
      console.error('Failed to delete organization:', error);
    }
  };

  // Campus Management Functions
  const handleAddCampus = () => {
    setCampusFormData({
      name: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'USA',
      phone: '',
      email: '',
      isPrimary: false
    });
    setSelectedOrganizationForCampus('');
    setShowAddCampusModal(true);
  };

  const handleEditCampus = (campus: Campus) => {
    setCampusFormData({
      name: campus.name,
      addressLine1: campus.address_line1 || '',
      addressLine2: campus.address_line2 || '',
      city: campus.city || '',
      state: campus.state || '',
      postalCode: campus.postal_code || '',
      country: campus.country || 'USA',
      phone: campus.phone || '',
      email: campus.email || '',
      isPrimary: campus.is_primary
    });
    setEditingCampus(campus);
    setShowEditCampusModal(true);
  };

  const handleDeleteCampus = async (id: string) => {
    if (!confirm('Are you sure you want to delete this campus? This action cannot be undone.')) {
      return;
    }

    try {
      await apiClient.deleteCampus(id);
      await loadData();
    } catch (error) {
      console.error('Failed to delete campus:', error);
    }
  };

  const handleSaveCampus = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingCampus) {
        await apiClient.updateCampus(editingCampus.id, campusFormData);
        setShowEditCampusModal(false);
      } else {
        if (!selectedOrganizationForCampus) {
          alert('Please select an organization for this campus');
          return;
        }
        await apiClient.createCampus(selectedOrganizationForCampus, campusFormData);
        setShowAddCampusModal(false);
      }
      
      setEditingCampus(null);
      await loadData();
    } catch (error) {
      console.error('Failed to save campus:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const requestData = {
        name: formData.name,
        catalogCode: formData.catalogCode,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        website: formData.website,
        clearanceRequirements: formData.clearanceRequirements.map(req => ({
          clearanceTypeId: req.clearance_type_id,
          isRequired: req.is_required,
          customValidityMonths: req.custom_validity_months,
          notes: req.notes
        }))
      };

      if (editingOrganization) {
        await apiClient.request(`/organizations/${editingOrganization.id}`, {
          method: 'PUT',
          body: JSON.stringify(requestData)
        });
        setShowEditModal(false);
      } else {
        await apiClient.request('/organizations', {
          method: 'POST',
          body: JSON.stringify(requestData)
        });
        setShowAddModal(false);
      }

      resetForm();
      await loadData();
    } catch (error) {
      console.error('Failed to save organization:', error);
    }
  };

  const addClearanceRequirement = () => {
    setFormData(prev => ({
      ...prev,
      clearanceRequirements: [
        ...prev.clearanceRequirements,
        {
          clearance_type_id: '',
          is_required: true,
          custom_validity_months: undefined,
          notes: ''
        }
      ]
    }));
  };

  const updateClearanceRequirement = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      clearanceRequirements: prev.clearanceRequirements.map((req, i) =>
        i === index ? { ...req, [field]: value } : req
      )
    }));
  };

  const removeClearanceRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      clearanceRequirements: prev.clearanceRequirements.filter((_, i) => i !== index)
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getClearanceTypeName = (clearanceTypeId: string) => {
    const clearanceType = clearanceTypes.find(ct => ct.id === clearanceTypeId);
    return clearanceType ? clearanceType.name : 'Unknown';
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'background_check': 'bg-red-100 text-red-800',
      'certification': 'bg-blue-100 text-blue-800',
      'training': 'bg-green-100 text-green-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Building className="h-8 w-8 text-amber-600 mr-3" />
            Organization Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage organizations, campuses, and clearance requirements
          </p>
        </div>
        <div className="flex space-x-2">
          {activeTab === 'organizations' && (
            <button
              onClick={handleAddOrganization}
              className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Organization</span>
            </button>
          )}
          {activeTab === 'campuses' && (
            <button
              onClick={handleAddCampus}
              className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Campus</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('organizations')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'organizations'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Building className="h-4 w-4 inline mr-2" />
            Organizations ({organizations.length})
          </button>
          <button
            onClick={() => setActiveTab('campuses')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'campuses'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <MapPin className="h-4 w-4 inline mr-2" />
            Campuses ({campuses.length})
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'organizations' && (
        <>
          {/* Search and Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search organizations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Building className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Organizations</p>
              <p className="text-2xl font-semibold text-gray-900">{organizations.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Award className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Clearance Types</p>
              <p className="text-2xl font-semibold text-gray-900">{clearanceTypes.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Organizations Table */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Organization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Requirements
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Programs
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
              {filteredOrganizations.map((org) => (
                <tr key={org.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{org.name}</div>
                      <div className="text-sm text-gray-500">Code: {org.catalog_code}</div>
                      {org.address && (
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          {org.address}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      {org.phone && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Phone className="h-3 w-3 mr-1" />
                          {org.phone}
                        </div>
                      )}
                      {org.email && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Mail className="h-3 w-3 mr-1" />
                          {org.email}
                        </div>
                      )}
                      {org.website && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Globe className="h-3 w-3 mr-1" />
                          <a href={org.website} target="_blank" rel="noopener noreferrer" 
                             className="hover:text-amber-600">
                            Website
                          </a>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 text-amber-600 mr-2" />
                      <span className="text-sm text-gray-900">
                        {org.required_clearances_count} clearances
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <BookOpen className="h-4 w-4 text-blue-600 mr-2" />
                      <span className="text-sm text-gray-900">
                        {org.programs_count} programs
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(org.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleEditOrganization(org)}
                        className="text-amber-600 hover:text-amber-900 p-1 rounded-md hover:bg-amber-50"
                        title="Edit Organization"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteOrganization(org.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50"
                        title="Delete Organization"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {editingOrganization ? 'Edit Organization' : 'Add New Organization'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Organization Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Catalog Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.catalogCode}
                      onChange={(e) => setFormData(prev => ({ ...prev, catalogCode: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Website
                    </label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Clearance Requirements */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium text-gray-900">Clearance Requirements</h3>
                    <button
                      type="button"
                      onClick={addClearanceRequirement}
                      className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 flex items-center space-x-1 text-sm"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Add Requirement</span>
                    </button>
                  </div>
                  
                  {formData.clearanceRequirements.map((req, index) => (
                    <div key={index} className="border border-gray-200 rounded-md p-4 mb-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Clearance Type *
                          </label>
                          <select
                            required
                            value={req.clearance_type_id}
                            onChange={(e) => updateClearanceRequirement(index, 'clearance_type_id', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          >
                            <option value="">Select clearance type...</option>
                            {clearanceTypes.map(ct => (
                              <option key={ct.id} value={ct.id}>
                                {ct.name} ({ct.category})
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Custom Validity (months)
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={req.custom_validity_months || ''}
                            onChange={(e) => updateClearanceRequirement(index, 'custom_validity_months', 
                              e.target.value ? parseInt(e.target.value) : undefined)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            placeholder="Use default"
                          />
                        </div>
                        
                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() => removeClearanceRequirement(index)}
                            className="w-full bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 flex items-center justify-center space-x-1"
                          >
                            <Trash2 className="h-3 w-3" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Notes
                        </label>
                        <input
                          type="text"
                          value={req.notes || ''}
                          onChange={(e) => updateClearanceRequirement(index, 'notes', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          placeholder="Optional notes about this requirement..."
                        />
                      </div>
                    </div>
                  ))}
                  
                  {formData.clearanceRequirements.length === 0 && (
                    <p className="text-gray-500 text-sm italic">
                      No clearance requirements added. Click "Add Requirement" to specify what clearances teachers need for this organization.
                    </p>
                  )}
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setShowEditModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700"
                  >
                    {editingOrganization ? 'Update Organization' : 'Create Organization'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
        </>
      )}

      {activeTab === 'campuses' && (
        <>
          {/* Campuses Search */}
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search campuses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Campuses List */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Campus Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Organization
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {campuses.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        <MapPin className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2">No campuses found</p>
                        <button
                          onClick={handleAddCampus}
                          className="mt-2 text-amber-600 hover:text-amber-700"
                        >
                          Add the first campus
                        </button>
                      </td>
                    </tr>
                  ) : (
                    campuses
                      .filter(campus => 
                        campus.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        campus.organization_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        campus.city?.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((campus) => (
                        <tr key={campus.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="flex items-center">
                                <div className="font-medium text-gray-900">{campus.name}</div>
                                {campus.is_primary && (
                                  <span className="ml-2 px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded-full">
                                    Primary
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{campus.organization_name}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {campus.address_line1}
                              {campus.address_line2 && <div>{campus.address_line2}</div>}
                              <div>{campus.city}, {campus.state} {campus.postal_code}</div>
                              {campus.country !== 'USA' && <div>{campus.country}</div>}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {campus.phone && (
                                <div className="flex items-center">
                                  <Phone className="h-3 w-3 text-gray-400 mr-1" />
                                  {campus.phone}
                                </div>
                              )}
                              {campus.email && (
                                <div className="flex items-center">
                                  <Mail className="h-3 w-3 text-gray-400 mr-1" />
                                  {campus.email}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              campus.is_active 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {campus.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handleEditCampus(campus)}
                                className="text-amber-600 hover:text-amber-900 p-1 rounded-md hover:bg-amber-50"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteCampus(campus.id)}
                                className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Add Campus Modal */}
      {showAddCampusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Add New Campus</h2>
              <form onSubmit={handleSaveCampus} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Organization *
                    </label>
                    <select
                      value={selectedOrganizationForCampus}
                      onChange={(e) => setSelectedOrganizationForCampus(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Organization</option>
                      {organizations.map((org) => (
                        <option key={org.id} value={org.id}>
                          {org.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Campus Name *
                    </label>
                    <input
                      type="text"
                      value={campusFormData.name}
                      onChange={(e) => setCampusFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address Line 1 *
                  </label>
                  <input
                    type="text"
                    value={campusFormData.addressLine1}
                    onChange={(e) => setCampusFormData(prev => ({ ...prev, addressLine1: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    value={campusFormData.addressLine2}
                    onChange={(e) => setCampusFormData(prev => ({ ...prev, addressLine2: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      value={campusFormData.city}
                      onChange={(e) => setCampusFormData(prev => ({ ...prev, city: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      value={campusFormData.state}
                      onChange={(e) => setCampusFormData(prev => ({ ...prev, state: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      value={campusFormData.postalCode}
                      onChange={(e) => setCampusFormData(prev => ({ ...prev, postalCode: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={campusFormData.phone}
                      onChange={(e) => setCampusFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={campusFormData.email}
                      onChange={(e) => setCampusFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPrimary"
                    checked={campusFormData.isPrimary}
                    onChange={(e) => setCampusFormData(prev => ({ ...prev, isPrimary: e.target.checked }))}
                    className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isPrimary" className="ml-2 block text-sm text-gray-900">
                    Set as primary campus
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddCampusModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700"
                  >
                    Create Campus
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Campus Modal */}
      {showEditCampusModal && editingCampus && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Edit Campus</h2>
              <form onSubmit={handleSaveCampus} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Campus Name *
                  </label>
                  <input
                    type="text"
                    value={campusFormData.name}
                    onChange={(e) => setCampusFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address Line 1 *
                  </label>
                  <input
                    type="text"
                    value={campusFormData.addressLine1}
                    onChange={(e) => setCampusFormData(prev => ({ ...prev, addressLine1: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    value={campusFormData.addressLine2}
                    onChange={(e) => setCampusFormData(prev => ({ ...prev, addressLine2: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      value={campusFormData.city}
                      onChange={(e) => setCampusFormData(prev => ({ ...prev, city: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      value={campusFormData.state}
                      onChange={(e) => setCampusFormData(prev => ({ ...prev, state: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      value={campusFormData.postalCode}
                      onChange={(e) => setCampusFormData(prev => ({ ...prev, postalCode: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={campusFormData.phone}
                      onChange={(e) => setCampusFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={campusFormData.email}
                      onChange={(e) => setCampusFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="editIsPrimary"
                    checked={campusFormData.isPrimary}
                    onChange={(e) => setCampusFormData(prev => ({ ...prev, isPrimary: e.target.checked }))}
                    className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                  />
                  <label htmlFor="editIsPrimary" className="ml-2 block text-sm text-gray-900">
                    Set as primary campus
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditCampusModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700"
                  >
                    Update Campus
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationManagementPage;