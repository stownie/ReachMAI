// API client for ReachMAI frontend
import type { AuthAccount, UserProfile } from '../types';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '' // Same domain in production
  : 'http://localhost:5000'; // Dev server

class ApiClient {
  private token: string | null = null;

  constructor() {
    // Load token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('reachmai_token');
      console.log('🔑 API Client initialized:', {
        hasLocalStorage: !!localStorage,
        tokenInStorage: !!localStorage.getItem('reachmai_token'),
        tokenLoaded: !!this.token,
        tokenPrefix: this.token ? this.token.substring(0, 20) + '...' : 'none'
      });
    }
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${API_BASE_URL}/api${endpoint}`;
    
    // Debug logging for token usage
    if (endpoint !== '/auth/login') {
      console.log(`🌐 API Request to ${endpoint}:`, {
        hasToken: !!this.token,
        tokenPrefix: this.token ? this.token.substring(0, 20) + '...' : 'none'
      });
    }
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication
  async login(email: string, password: string): Promise<{ token: string; account: AuthAccount }> {
    console.log('🔐 API Client: Attempting login for:', email);
    
    const result = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    console.log('✅ API Client: Login successful, storing token');
    console.log('🔑 Token received:', result.token ? result.token.substring(0, 20) + '...' : 'none');
    
    this.token = result.token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('reachmai_token', result.token);
      console.log('💾 Token stored in localStorage');
    }
    
    return result;
  }

  async register(userData: {
    email: string;
    phone?: string;
    password: string;
    profile: {
      type: string;
      firstName: string;
      lastName: string;
    };
  }): Promise<{ token: string; account: AuthAccount }> {
    const result = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    this.token = result.token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('reachmai_token', result.token);
    }
    
    return result;
  }

  logout(): void {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('reachmai_token');
    }
  }

  // Profiles
  async getProfiles(): Promise<UserProfile[]> {
    return await this.request('/profiles');
  }

  async createProfile(profileData: any): Promise<UserProfile> {
    return await this.request('/profiles', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  }

  // Classes
  async getClasses(profileId: string): Promise<any[]> {
    return await this.request(`/classes?profileId=${profileId}`);
  }

  // Assignments
  async getAssignments(profileId: string, classId?: string): Promise<any[]> {
    const params = new URLSearchParams({ profileId });
    if (classId) params.append('classId', classId);
    return await this.request(`/assignments?${params.toString()}`);
  }

  // Attendance
  async getAttendance(profileId: string, classId?: string, startDate?: string, endDate?: string): Promise<any[]> {
    const params = new URLSearchParams({ profileId });
    if (classId) params.append('classId', classId);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return await this.request(`/attendance?${params.toString()}`);
  }

  // Billing
  async getBilling(): Promise<any[]> {
    return await this.request('/billing');
  }

  // Notifications
  async getNotifications(profileId: string): Promise<any[]> {
    return await this.request(`/notifications?profileId=${profileId}`);
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return await this.request('/health');
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    // Always check localStorage for latest token
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('reachmai_token');
      if (storedToken && storedToken !== this.token) {
        console.log('🔄 Token updated from localStorage');
        this.token = storedToken;
      }
    }
    return !!this.token;
  }

  // Method to refresh token from localStorage
  refreshTokenFromStorage(): void {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('reachmai_token');
      console.log('🔄 Refreshing token from storage:', {
        hadToken: !!this.token,
        storageToken: !!storedToken,
        tokenChanged: storedToken !== this.token
      });
      this.token = storedToken;
    }
  }

  // Staff Management API methods
  async getStaff(): Promise<any[]> {
    return this.request('/staff');
  }

  async getStaffInvitations(): Promise<any[]> {
    return this.request('/staff/invitations');
  }

  async inviteStaff(invitationData: {
    email: string;
    firstName: string;
    lastName: string;
    role: 'admin' | 'teacher' | 'manager';
  }): Promise<any> {
    return this.request('/staff/invite', {
      method: 'POST',
      body: JSON.stringify(invitationData),
    });
  }

  async updateStaff(staffId: string, updateData: {
    firstName: string;
    lastName: string;
    role: 'admin' | 'teacher' | 'manager';
    status: 'active' | 'inactive';
  }): Promise<any> {
    return this.request(`/staff/${staffId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  async deleteStaff(staffId: string): Promise<any> {
    return this.request(`/staff/${staffId}`, {
      method: 'DELETE',
    });
  }

  async cancelInvitation(invitationId: string): Promise<any> {
    return this.request(`/staff/invitations/${invitationId}`, {
      method: 'DELETE',
    });
  }

  async resendInvitation(invitationId: string): Promise<any> {
    return this.request(`/staff/invitations/${invitationId}/resend`, {
      method: 'POST',
    });
  }

  // User Management API methods
  async getAllUsers(): Promise<any[]> {
    return this.request('/users');
  }

  async createUser(userData: {
    email: string;
    phone?: string;
    password: string;
    profile: {
      type: 'student' | 'parent' | 'adult' | 'teacher' | 'admin' | 'manager';
      firstName: string;
      lastName: string;
      preferredName?: string;
      preferredContactMethod: 'email' | 'phone';
    };
  }): Promise<any> {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(userId: string, updateData: {
    profile: {
      firstName: string;
      lastName: string;
      preferredName?: string;
      phone?: string;
      preferredContactMethod: 'email' | 'phone';
    };
  }): Promise<any> {
    return this.request(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  async deleteUser(userId: string): Promise<any> {
    return this.request(`/users/${userId}`, {
      method: 'DELETE',
    });
  }

  async bulkDeleteUsers(userIds: string[]): Promise<any> {
    return this.request('/users/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ userIds }),
    });
  }

  async getUsersByType(userType: 'student' | 'parent' | 'adult' | 'teacher' | 'admin' | 'manager'): Promise<any[]> {
    return this.request(`/users?type=${userType}`);
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Helper hook for React components
export function useApi() {
  return apiClient;
}