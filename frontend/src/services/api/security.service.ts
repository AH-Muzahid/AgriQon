import { apiClient } from './client';

export interface MfaSetupResponse {
  secret: string;
  qrCodeDataUrl: string;
}

export interface MfaVerifyResponse {
  success: boolean;
  backupCodes: string[];
}

export interface SessionInfo {
  id: string;
  ipAddress: string;
  userAgent: string;
  browser: string;
  os: string;
  device: string;
  lastUsedAt: string;
  createdAt: string;
  expiresAt: string;
}

export interface LoginActivity {
  id: string;
  email: string;
  ipAddress: string;
  userAgent: string;
  status: 'SUCCESS' | 'FAILED_PASSWORD' | 'LOCKED' | 'MFA_REQUIRED';
  createdAt: string;
}

export interface LoginActivityResponse {
  items: LoginActivity[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface IpRule {
  id: string;
  ipRange: string;
  type: 'ALLOW' | 'DENY';
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const securityService = {
  async getMfaSetup(): Promise<MfaSetupResponse> {
    const res = await apiClient.client.post('/security/mfa/setup');
    return res.data.data;
  },

  async verifyAndEnableMfa(code: string): Promise<MfaVerifyResponse> {
    const res = await apiClient.client.post('/security/mfa/verify-enable', { code });
    return res.data;
  },

  async disableMfa(code: string): Promise<{ success: boolean }> {
    const res = await apiClient.client.post('/security/mfa/disable', { code });
    return res.data;
  },

  async listSessions(): Promise<SessionInfo[]> {
    const res = await apiClient.client.get('/security/sessions');
    return res.data.data;
  },

  async revokeSession(sessionId: string): Promise<{ success: boolean }> {
    const res = await apiClient.client.post(`/security/sessions/${sessionId}/revoke`);
    return res.data;
  },

  async revokeAllOtherSessions(): Promise<{ success: boolean }> {
    const res = await apiClient.client.post('/security/sessions/revoke-others');
    return res.data;
  },

  async listLoginActivity(page = 1, limit = 10): Promise<LoginActivityResponse> {
    const res = await apiClient.client.get(`/security/login-activity?page=${page}&limit=${limit}`);
    return res.data.data;
  },

  async listIpRules(): Promise<IpRule[]> {
    const res = await apiClient.client.get('/security/ip-rules');
    return res.data.data;
  },

  async createIpRule(data: { ipRange: string; type: 'ALLOW' | 'DENY'; description?: string }): Promise<IpRule> {
    const res = await apiClient.client.post('/security/ip-rules', data);
    return res.data.data;
  },

  async updateIpRule(id: string, data: { ipRange?: string; type?: 'ALLOW' | 'DENY'; description?: string; isActive?: boolean }): Promise<IpRule> {
    const res = await apiClient.client.patch(`/security/ip-rules/${id}`, data);
    return res.data.data;
  },

  async deleteIpRule(id: string): Promise<{ success: boolean }> {
    const res = await apiClient.client.delete(`/security/ip-rules/${id}`);
    return res.data;
  },
};
