import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, BookOpen, Tag } from 'lucide-react';
import type { Program, ProgramCategory } from '../types';
import { apiClient } from '../lib/api';

const ProgramManagementPage: React.FC = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [categories, setCategories] = useState<ProgramCategory[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'programs' | 'categories'>('programs');
  
  // Program modal state
  const [showProgramModal, setShowProgramModal] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [programFormData, setProgramFormData] = useState({
    name: '',
    description: '',
    organizationId: '',
    categoryId: '',
    ageGroup: '',
    maxStudents: '',
    pricePerSession: '',
    isActive: true
  });

  // Category modal state
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProgramCategory | null>(null);
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: '',
    isActive: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [programsData, categoriesData, organizationsData] = await Promise.all([
        apiClient.getPrograms(),
        apiClient.getProgramCategories(),
        apiClient.getOrganizations()
      ]);
      
      setPrograms(programsData);
      setCategories(categoriesData);
      setOrganizations(organizationsData);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  // Program functions
  const handleAddProgram = () => {
    setEditingProgram(null);
    setProgramFormData({
      name: '',
      description: '',
      organizationId: '',
      categoryId: '',
      ageGroup: '',
      maxStudents: '',
      pricePerSession: '',
      isActive: true
    });
    setShowProgramModal(true);
  };

  const handleEditProgram = (program: Program) => {
    setEditingProgram(program);
    setProgramFormData({
      name: program.name,
      description: program.description || '',
      organizationId: program.organizationId,
      categoryId: program.categoryId,
      ageGroup: program.ageGroup || '',
      maxStudents: program.maxStudents?.toString() || '',
      pricePerSession: program.pricePerSession?.toString() || '',
      isActive: program.isActive
    });
    setShowProgramModal(true);
  };

  const handleSaveProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const programData = {
        name: programFormData.name,
        description: programFormData.description || undefined,
        organizationId: programFormData.organizationId,
        categoryId: programFormData.categoryId,
        ageGroup: programFormData.ageGroup || undefined,
        maxStudents: programFormData.maxStudents ? parseInt(programFormData.maxStudents) : undefined,
        pricePerSession: programFormData.pricePerSession ? parseFloat(programFormData.pricePerSession) : undefined,
        isActive: programFormData.isActive
      };

      if (editingProgram) {
        await apiClient.updateProgram(editingProgram.id, programData);
        alert('Program updated successfully!');
      } else {
        await apiClient.createProgram(programData);
        alert('Program created successfully!');
      }

      setShowProgramModal(false);
      setProgramFormData({
        name: '',
        description: '',
        organizationId: '',
        categoryId: '',
        ageGroup: '',
        maxStudents: '',
        pricePerSession: '',
        isActive: true
      });
      setEditingProgram(null);
      
      await loadData();
    } catch (error) {
      console.error('Error saving program:', error);
      alert('Error saving program. Please try again.');
    }
  };

  const handleDeleteProgram = async (program: Program) => {
    if (confirm(`Are you sure you want to delete "${program.name}"?`)) {
      try {
        await apiClient.deleteProgram(program.id);
        alert('Program deleted successfully!');
        await loadData();
      } catch (error) {
        console.error('Error deleting program:', error);
        alert('Error deleting program. Please try again.');
      }
    }
  };

  // Category functions
  const handleAddCategory = () => {
    setEditingCategory(null);
    setCategoryFormData({
      name: '',
      description: '',
      isActive: true
    });
    setShowCategoryModal(true);
  };

  const handleEditCategory = (category: ProgramCategory) => {
    setEditingCategory(category);
    setCategoryFormData({
      name: category.name,
      description: category.description || '',
      isActive: category.isActive
    });
    setShowCategoryModal(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const categoryData = {
        name: categoryFormData.name,
        description: categoryFormData.description || undefined,
        isActive: categoryFormData.isActive
      };

      if (editingCategory) {
        await apiClient.updateProgramCategory(editingCategory.id, categoryData);
        alert('Category updated successfully!');
      } else {
        await apiClient.createProgramCategory(categoryData);
        alert('Category created successfully!');
      }

      setShowCategoryModal(false);
      setCategoryFormData({
        name: '',
        description: '',
        isActive: true
      });
      setEditingCategory(null);
      
      await loadData();
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Error saving category. Please try again.');
    }
  };

  const handleDeleteCategory = async (category: ProgramCategory) => {
    if (confirm(`Are you sure you want to delete "${category.name}"?`)) {
      try {
        await apiClient.deleteProgramCategory(category.id);
        alert('Category deleted successfully!');
        await loadData();
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('Error deleting category. Please try again.');
      }
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Unknown Category';
  };

  const getOrganizationName = (organizationId: string) => {
    const organization = organizations.find(o => o.id === organizationId);
    return organization?.name || 'Unknown Organization';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Program Management</h1>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('programs')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'programs'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <BookOpen className="inline w-4 h-4 mr-2" />
            Programs ({programs.length})
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'categories'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Tag className="inline w-4 h-4 mr-2" />
            Categories ({categories.length})
          </button>
        </nav>
      </div>

      {/* Programs Tab */}
      {activeTab === 'programs' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Programs</h2>
            <button
              onClick={handleAddProgram}
              className="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Program
            </button>
          </div>

          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Program Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Organization
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Age Group
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
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
                {programs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2">No programs found</p>
                      <button
                        onClick={handleAddProgram}
                        className="mt-2 text-amber-600 hover:text-amber-700"
                      >
                        Add the first program
                      </button>
                    </td>
                  </tr>
                ) : (
                  programs.map((program) => (
                    <tr key={program.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{program.name}</div>
                          {program.description && (
                            <div className="text-sm text-gray-500">{program.description}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getOrganizationName(program.organizationId)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getCategoryName(program.categoryId)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {program.ageGroup || 'Not specified'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {program.pricePerSession ? `$${program.pricePerSession}` : 'Not specified'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          program.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {program.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditProgram(program)}
                          className="text-amber-600 hover:text-amber-900 mr-3"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProgram(program)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Program Categories</h2>
            <button
              onClick={handleAddCategory}
              className="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Category
            </button>
          </div>

          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
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
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                      <Tag className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2">No categories found</p>
                      <button
                        onClick={handleAddCategory}
                        className="mt-2 text-amber-600 hover:text-amber-700"
                      >
                        Add the first category
                      </button>
                    </td>
                  </tr>
                ) : (
                  categories.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {category.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {category.description || 'No description'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          category.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {category.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="text-amber-600 hover:text-amber-900 mr-3"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Program Modal */}
      {showProgramModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingProgram ? 'Edit Program' : 'Add New Program'}
            </h2>
            
            <form onSubmit={handleSaveProgram} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Program Name *
                  </label>
                  <input
                    type="text"
                    value={programFormData.name}
                    onChange={(e) => setProgramFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Organization *
                  </label>
                  <select
                    value={programFormData.organizationId}
                    onChange={(e) => setProgramFormData(prev => ({ ...prev, organizationId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  >
                    <option value="">Select Organization</option>
                    {organizations.map(org => (
                      <option key={org.id} value={org.id}>{org.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={programFormData.categoryId}
                    onChange={(e) => setProgramFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Age Group
                  </label>
                  <input
                    type="text"
                    value={programFormData.ageGroup}
                    onChange={(e) => setProgramFormData(prev => ({ ...prev, ageGroup: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="e.g., 5-8 years, Teenagers, Adults"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Students
                  </label>
                  <input
                    type="number"
                    value={programFormData.maxStudents}
                    onChange={(e) => setProgramFormData(prev => ({ ...prev, maxStudents: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    min="1"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price per Session
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={programFormData.pricePerSession}
                    onChange={(e) => setProgramFormData(prev => ({ ...prev, pricePerSession: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    min="0"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={programFormData.description}
                  onChange={(e) => setProgramFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  rows={3}
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="programActive"
                  checked={programFormData.isActive}
                  onChange={(e) => setProgramFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                />
                <label htmlFor="programActive" className="ml-2 block text-sm text-gray-900">
                  Active Program
                </label>
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowProgramModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700"
                >
                  {editingProgram ? 'Update Program' : 'Create Program'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h2>
            
            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={categoryFormData.name}
                  onChange={(e) => setCategoryFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={categoryFormData.description}
                  onChange={(e) => setCategoryFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  rows={3}
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="categoryActive"
                  checked={categoryFormData.isActive}
                  onChange={(e) => setCategoryFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                />
                <label htmlFor="categoryActive" className="ml-2 block text-sm text-gray-900">
                  Active Category
                </label>
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700"
                >
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgramManagementPage;