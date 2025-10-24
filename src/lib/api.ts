// API client for ReachMAI frontend
import type { AuthAccount, UserProfile } from '../types';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '' // Same domain in production
  : 'http://localhost:3000'; // Dev server

class ApiClient {
  private token: string | null = null;

  constructor() {
    // Load token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('reachmai_token');
    }
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${API_BASE_URL}/api${endpoint}`;
    
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
    const result = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    this.token = result.token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('reachmai_token', result.token);
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
    return !!this.token;
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Helper hook for React components
export function useApi() {
  return apiClient;
}