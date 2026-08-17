const API_BASE = 'http://localhost:5000/api';

interface ApiOptions {
  method?: string;
  body?: unknown;
  token?: string;
}

interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

async function apiRequest<T = unknown>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<ApiResponse<T>> {
  const { method = 'GET', body, token } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new ApiError(data.error || 'Request failed', res.status);
  }

  return data;
}

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

// ── Auth API ──

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  city?: string;
  ward?: string;
  locality?: string;
  community?: string;
  isOnboarded: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
  permissions: string[];
}

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
  role?: string;
}): Promise<AuthResponse> {
  const res = await apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: data,
  });
  if (!res.data) throw new ApiError(res.error || 'Registration failed', 400);
  return res.data;
}

export async function loginUser(data: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const res = await apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: data,
  });
  if (!res.data) throw new ApiError(res.error || 'Login failed', 400);
  return res.data;
}

export async function getMe(token: string): Promise<{ user: AuthUser; permissions: string[] }> {
  const res = await apiRequest<{ user: AuthUser; permissions: string[] }>('/auth/me', { token });
  if (!res.data) throw new ApiError(res.error || 'Failed to get user', 401);
  return res.data;
}

export async function updateProfile(
  token: string,
  data: Record<string, unknown>
): Promise<{ user: AuthUser }> {
  const res = await apiRequest<{ user: AuthUser }>('/auth/profile', {
    method: 'PUT',
    body: data,
    token,
  });
  if (!res.data) throw new ApiError(res.error || 'Failed to update profile', 400);
  return res.data;
}

export async function logoutUser(token: string): Promise<void> {
  await apiRequest('/auth/logout', { method: 'POST', token });
}

// ── Health Check ──

export async function checkHealth(): Promise<{ status: string; database: string }> {
  const res = await apiRequest<{ status: string; database: string }>('/health');
  if (!res.data) throw new ApiError('Health check failed', 500);
  return res.data;
}
