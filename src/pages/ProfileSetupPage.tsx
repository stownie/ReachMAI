import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Phone, 
  CheckCircle, 
  AlertCircle,
  User,
  Shield,
  GraduationCap,
  UserCheck,
  Building,
  Heart
} from 'lucide-react';
import { apiClient } from '../lib/api';

const ProfileSetupPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [tokenData, setTokenData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
    preferredContactMethod: 'email' as 'email' | 'phone',
    phone: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const profileTypeIcons = {
    'student': GraduationCap,
    'parent': Heart,
    'adult': User,
    'teacher': UserCheck,
    'admin': Shield,
    'manager': Building
  };

  const profileTypeNames = {
    'student': 'Student',
    'parent': 'Parent/Guardian',
    'adult': 'Adult Student', 
    'teacher': 'Teacher',
    'admin': 'Administrator',
    'manager': 'Manager'
  };

  useEffect(() => {
    validateToken();
  }, []);

  const validateToken = async () => {
    if (!token) {
      setError('Invalid or missing invitation token');
      setLoading(false);
      return;
    }

    try {
      const response = await apiClient.validateSetupToken(token);
      if (response.valid) {
        setTokenData(response.data);
        setFormData(prev => ({
          ...prev,
          phone: response.data.phone || ''
        }));
      } else {
        setError(response.message || 'Invalid or expired invitation token');
      }
    } catch (error) {
      console.error('Token validation error:', error);
      setError('Failed to validate invitation token');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    // Validate form
    if (!formData.password || formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      setSubmitting(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setSubmitting(false);
      return;
    }

    if (formData.preferredContactMethod === 'phone' && !formData.phone.trim()) {
      setError('Phone number is required when phone is the preferred contact method');
      setSubmitting(false);
      return;
    }

    try {
      const setupData = {
        token,
        password: formData.password,
        preferredContactMethod: formData.preferredContactMethod,
        phone: formData.phone.trim() || undefined
      };

      const response = await apiClient.completeProfileSetup(setupData);
      
      if (response.success) {
        setSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } else {
        setError(response.message || 'Failed to complete profile setup');
      }
    } catch (error) {
      console.error('Profile setup error:', error);
      setError(error instanceof Error ? error.message : 'Failed to complete profile setup');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Validating invitation...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile Setup Complete!</h2>
          <p className="text-gray-600 mb-6">
            Your account has been activated successfully. You can now log in with your credentials.
          </p>
          <p className="text-sm text-gray-500">
            Redirecting to login page in 3 seconds...
          </p>
        </div>
      </div>
    );
  }

  if (error && !tokenData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Invalid Invitation</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-amber-600 text-white px-6 py-2 rounded-md hover:bg-amber-700 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  const ProfileIcon = profileTypeIcons[tokenData?.profileType as keyof typeof profileTypeIcons] || User;
  const profileTypeName = profileTypeNames[tokenData?.profileType as keyof typeof profileTypeNames] || tokenData?.profileType;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-amber-600 px-8 py-6 text-white">
            <div className="flex items-center space-x-4">
              <div className="bg-white bg-opacity-20 p-3 rounded-full">
                <ProfileIcon className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Complete Your Profile</h1>
                <p className="text-amber-100">Welcome to Musical Arts Institute, {tokenData?.firstName}!</p>
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="px-8 py-6 bg-gray-50 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Profile Information</h3>
                <p className="text-sm text-gray-600">
                  {tokenData?.firstName} {tokenData?.lastName} • {profileTypeName}
                </p>
                <p className="text-sm text-gray-500">{tokenData?.email}</p>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Setup Required
                </span>
              </div>
            </div>
          </div>

          {/* Setup Form */}
          <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-2 mt-0.5" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
            )}

            {/* Password Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Set Your Password</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent pr-10"
                    placeholder="Enter your password"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Minimum 8 characters required
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent pr-10"
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Contact Preferences */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Contact Preferences</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Preferred Contact Method *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="relative">
                    <input
                      type="radio"
                      name="preferredContactMethod"
                      value="email"
                      checked={formData.preferredContactMethod === 'email'}
                      onChange={(e) => setFormData(prev => ({ ...prev, preferredContactMethod: e.target.value as 'email' | 'phone' }))}
                      className="sr-only"
                    />
                    <div className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      formData.preferredContactMethod === 'email'
                        ? 'border-amber-500 bg-amber-50 text-amber-900'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <div className="flex items-center space-x-3">
                        <Mail className="h-5 w-5" />
                        <div>
                          <p className="font-medium">Email</p>
                          <p className="text-sm text-gray-600">{tokenData?.email}</p>
                        </div>
                      </div>
                    </div>
                  </label>

                  <label className="relative">
                    <input
                      type="radio"
                      name="preferredContactMethod"
                      value="phone"
                      checked={formData.preferredContactMethod === 'phone'}
                      onChange={(e) => setFormData(prev => ({ ...prev, preferredContactMethod: e.target.value as 'email' | 'phone' }))}
                      className="sr-only"
                    />
                    <div className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      formData.preferredContactMethod === 'phone'
                        ? 'border-amber-500 bg-amber-50 text-amber-900'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <div className="flex items-center space-x-3">
                        <Phone className="h-5 w-5" />
                        <div>
                          <p className="font-medium">Phone</p>
                          <p className="text-sm text-gray-600">SMS & Calls</p>
                        </div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Phone Number Field - shown when phone is preferred or if they already have a phone */}
              {(formData.preferredContactMethod === 'phone' || tokenData?.phone) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number {formData.preferredContactMethod === 'phone' ? '*' : '(Optional)'}
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="(555) 123-4567"
                    required={formData.preferredContactMethod === 'phone'}
                  />
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-amber-600 text-white py-3 px-4 rounded-md hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {submitting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                <span>{submitting ? 'Completing Setup...' : 'Complete Profile Setup'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetupPage;