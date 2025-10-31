import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Plus, 
  Search, 
  Users, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock,
  Building,
  User
} from 'lucide-react';
import { apiClient } from '../lib/api';

interface Teacher {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  is_active: boolean;
}

interface ClearanceType {
  id: string;
  name: string;
  description?: string;
  category: string;
  expires: boolean;
  default_validity_months?: number;
}

interface TeacherClearance {
  id: string;
  teacher_id: string;
  clearance_type_id: string;
  clearance_name: string;
  description?: string;
  category: string;
  issued_date: string;
  expiration_date?: string;
  issuing_authority?: string;
  certificate_number?: string;
  status: 'active' | 'expired' | 'revoked' | 'pending';
  validity_status: 'permanent' | 'valid' | 'expired';
  notes?: string;
  document_url?: string;
}

interface TeacherEligibility {
  teacher_id: string;
  first_name: string;
  last_name: string;
  email: string;
  organization_id: string;
  organization_name: string;
  required_clearances: number;
  valid_clearances: number;
  is_eligible: boolean;
}

const TeacherClearanceManagementPage: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [clearanceTypes, setClearanceTypes] = useState<ClearanceType[]>([]);
  const [teacherClearances, setTeacherClearances] = useState<Record<string, TeacherClearance[]>>({});
  const [eligibilityData, setEligibilityData] = useState<TeacherEligibility[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddClearanceModal, setShowAddClearanceModal] = useState(false);
  const [viewMode, setViewMode] = useState<'teachers' | 'eligibility'>('teachers');

  const [clearanceFormData, setClearanceFormData] = useState({
    clearanceTypeId: '',
    issuedDate: '',
    expirationDate: '',
    issuingAuthority: '',
    certificateNumber: '',
    notes: '',
    documentUrl: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load teachers (filter for teacher profile type)
      const usersResponse = await apiClient.getUsers();
      const teacherUsers = usersResponse.filter((user: any) => 
        user.profiles?.some((profile: any) => profile.profileType === 'teacher' && profile.isActive)
      );
      
      const teacherProfiles = teacherUsers.flatMap((user: any) => 
        user.profiles
          .filter((profile: any) => profile.profileType === 'teacher' && profile.isActive)
          .map((profile: any) => ({
            id: profile.id,
            first_name: profile.firstName,
            last_name: profile.lastName,
            email: profile.email,
            phone: profile.phone,
            is_active: profile.isActive
          }))
      );
      
      setTeachers(teacherProfiles);

      // Load clearance types and eligibility data - using fetch since these are new endpoints
      const [clearanceTypesResponse, eligibilityResponse] = await Promise.all([
        fetch('/api/clearance-types', { 
          headers: { 'Authorization': `Bearer ${apiClient.getToken()}` } 
        }).then(res => res.json()),
        fetch('/api/teachers/eligibility', { 
          headers: { 'Authorization': `Bearer ${apiClient.getToken()}` } 
        }).then(res => res.json())
      ]);
      
      setClearanceTypes(clearanceTypesResponse);
      setEligibilityData(eligibilityResponse);

      // Load clearances for each teacher
      const clearancesData: Record<string, TeacherClearance[]> = {};
      for (const teacher of teacherProfiles) {
        try {
          const response = await fetch(`/api/teachers/${teacher.id}/clearances`, {
            headers: { 'Authorization': `Bearer ${apiClient.getToken()}` }
          });
          const clearances = await response.json();
          clearancesData[teacher.id] = clearances;
        } catch (error) {
          console.error(`Failed to load clearances for teacher ${teacher.id}:`, error);
          clearancesData[teacher.id] = [];
        }
      }
      setTeacherClearances(clearancesData);

    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClearance = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setClearanceFormData({
      clearanceTypeId: '',
      issuedDate: '',
      expirationDate: '',
      issuingAuthority: '',
      certificateNumber: '',
      notes: '',
      documentUrl: ''
    });
    setShowAddClearanceModal(true);
  };

  const handleSubmitClearance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacher) return;

    try {
      await fetch(`/api/teachers/${selectedTeacher.id}/clearances`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiClient.getToken()}`
        },
        body: JSON.stringify({
          clearanceTypeId: clearanceFormData.clearanceTypeId,
          issuedDate: clearanceFormData.issuedDate,
          expirationDate: clearanceFormData.expirationDate || undefined,
          issuingAuthority: clearanceFormData.issuingAuthority,
          certificateNumber: clearanceFormData.certificateNumber,
          notes: clearanceFormData.notes,
          documentUrl: clearanceFormData.documentUrl
        })
      });

      setShowAddClearanceModal(false);
      await loadData(); // Reload data to refresh clearances
    } catch (error) {
      console.error('Failed to add clearance:', error);
    }
  };

  const getStatusColor = (status: string, validityStatus: string) => {
    if (status === 'revoked') return 'bg-red-100 text-red-800';
    if (status === 'pending') return 'bg-yellow-100 text-yellow-800';
    if (validityStatus === 'expired') return 'bg-red-100 text-red-800';
    if (validityStatus === 'valid' || validityStatus === 'permanent') return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string, validityStatus: string) => {
    if (status === 'revoked') return <XCircle className="h-4 w-4" />;
    if (status === 'pending') return <Clock className="h-4 w-4" />;
    if (validityStatus === 'expired') return <AlertTriangle className="h-4 w-4" />;
    if (validityStatus === 'valid' || validityStatus === 'permanent') return <CheckCircle className="h-4 w-4" />;
    return <Clock className="h-4 w-4" />;
  };



  const getDaysUntilExpiration = (expirationDate: string) => {
    const expiration = new Date(expirationDate);
    const today = new Date();
    const diffTime = expiration.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const filteredTeachers = teachers.filter(teacher =>
    `${teacher.first_name} ${teacher.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEligibility = eligibilityData.filter(item =>
    `${item.first_name} ${item.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.organization_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <Award className="h-8 w-8 text-amber-600 mr-3" />
            Teacher Clearance Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage teacher clearances and organization eligibility
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('teachers')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'teachers' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users className="h-4 w-4 inline mr-2" />
              Teachers
            </button>
            <button
              onClick={() => setViewMode('eligibility')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'eligibility' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Building className="h-4 w-4 inline mr-2" />
              Eligibility
            </button>
          </div>
        </div>
      </div>

      {/* Search and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder={viewMode === 'teachers' ? "Search teachers..." : "Search teachers or organizations..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Active Teachers</p>
              <p className="text-2xl font-semibold text-gray-900">{teachers.length}</p>
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

      {/* Teachers View */}
      {viewMode === 'teachers' && (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teacher
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clearances
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expiring Soon
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTeachers.map((teacher) => {
                  const clearances = teacherClearances[teacher.id] || [];
                  const expiringSoon = clearances.filter(c => 
                    c.expiration_date && getDaysUntilExpiration(c.expiration_date) <= 30 && getDaysUntilExpiration(c.expiration_date) > 0
                  );
                  
                  return (
                    <tr key={teacher.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                              <User className="h-5 w-5 text-amber-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {teacher.first_name} {teacher.last_name}
                            </div>
                            <div className="text-sm text-gray-500">{teacher.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {clearances.slice(0, 3).map((clearance) => (
                            <span
                              key={clearance.id}
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(clearance.status, clearance.validity_status)}`}
                            >
                              {getStatusIcon(clearance.status, clearance.validity_status)}
                              <span className="ml-1">{clearance.clearance_name}</span>
                            </span>
                          ))}
                          {clearances.length > 3 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              +{clearances.length - 3} more
                            </span>
                          )}
                          {clearances.length === 0 && (
                            <span className="text-sm text-gray-500 italic">No clearances</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {expiringSoon.length > 0 ? (
                          <div className="flex items-center text-orange-600">
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            <span className="text-sm">{expiringSoon.length} expiring</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-green-600">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            <span className="text-sm">All current</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleAddClearance(teacher)}
                          className="bg-amber-600 text-white px-3 py-1 rounded-md hover:bg-amber-700 flex items-center space-x-1 text-sm ml-auto"
                        >
                          <Plus className="h-3 w-3" />
                          <span>Add Clearance</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Eligibility View */}
      {viewMode === 'eligibility' && (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teacher
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Organization
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clearance Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Eligibility
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEligibility.map((item) => (
                  <tr key={`${item.teacher_id}-${item.organization_id}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                            <User className="h-4 w-4 text-amber-600" />
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {item.first_name} {item.last_name}
                          </div>
                          <div className="text-sm text-gray-500">{item.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Building className="h-4 w-4 text-blue-600 mr-2" />
                        <span className="text-sm text-gray-900">{item.organization_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {item.valid_clearances} of {item.required_clearances} clearances
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className={`h-2 rounded-full ${
                            item.is_eligible ? 'bg-green-600' : 'bg-red-600'
                          }`}
                          style={{ 
                            width: `${item.required_clearances > 0 ? (item.valid_clearances / item.required_clearances) * 100 : 0}%` 
                          }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.is_eligible ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Eligible
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <XCircle className="h-3 w-3 mr-1" />
                          Not Eligible
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Clearance Modal */}
      {showAddClearanceModal && selectedTeacher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Add Clearance for {selectedTeacher.first_name} {selectedTeacher.last_name}
              </h2>
              
              <form onSubmit={handleSubmitClearance} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Clearance Type *
                  </label>
                  <select
                    required
                    value={clearanceFormData.clearanceTypeId}
                    onChange={(e) => setClearanceFormData(prev => ({ ...prev, clearanceTypeId: e.target.value }))}
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Issued Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={clearanceFormData.issuedDate}
                      onChange={(e) => setClearanceFormData(prev => ({ ...prev, issuedDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expiration Date
                    </label>
                    <input
                      type="date"
                      value={clearanceFormData.expirationDate}
                      onChange={(e) => setClearanceFormData(prev => ({ ...prev, expirationDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Issuing Authority
                    </label>
                    <input
                      type="text"
                      value={clearanceFormData.issuingAuthority}
                      onChange={(e) => setClearanceFormData(prev => ({ ...prev, issuingAuthority: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="e.g., State Department of Education"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Certificate Number
                    </label>
                    <input
                      type="text"
                      value={clearanceFormData.certificateNumber}
                      onChange={(e) => setClearanceFormData(prev => ({ ...prev, certificateNumber: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="Certificate/License number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Document URL
                  </label>
                  <input
                    type="url"
                    value={clearanceFormData.documentUrl}
                    onChange={(e) => setClearanceFormData(prev => ({ ...prev, documentUrl: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="https://example.com/certificate.pdf"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={clearanceFormData.notes}
                    onChange={(e) => setClearanceFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Optional notes about this clearance..."
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowAddClearanceModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700"
                  >
                    Add Clearance
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

export default TeacherClearanceManagementPage;